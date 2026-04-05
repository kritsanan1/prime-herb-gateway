import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
    apiVersion: "2025-08-27.basil",
  });

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  let event: Stripe.Event;

  // Always verify webhook signature — reject if secret or signature is missing
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  if (!webhookSecret || !sig) {
    console.error("Missing STRIPE_WEBHOOK_SECRET or stripe-signature header");
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return new Response(JSON.stringify({ error: "Invalid signature" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  console.log("Stripe event:", event.type);

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.order_id;

    if (orderId && session.payment_status === "paid") {
      const { error } = await supabaseAdmin
        .from("orders")
        .update({
          status: "paid",
          payment_status: "paid",
        })
        .eq("id", orderId);

      if (error) {
        console.error("Failed to update order:", error);
      } else {
        console.log(`Order ${orderId} marked as paid`);

        // Send notification email (fire and forget)
        try {
          const { data: order } = await supabaseAdmin
            .from("orders")
            .select("*")
            .eq("id", orderId)
            .single();

          if (order) {
            await fetch(
              `${Deno.env.get("SUPABASE_URL")}/functions/v1/send-order-email`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
                },
                body: JSON.stringify({
                  type: "payment_success",
                  order,
                }),
              }
            );
          }
        } catch (emailErr) {
          console.error("Email notification failed:", emailErr);
        }
      }
    }
  }

  if (event.type === "charge.refunded") {
    const charge = event.data.object as Stripe.Charge;
    const paymentIntent = charge.payment_intent as string;

    // Find order by looking up the checkout session
    // For now, log refund event
    console.log("Refund received for payment:", paymentIntent);
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status: 200,
  });
});
