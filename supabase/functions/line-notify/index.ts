import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LINE_CHANNEL_ACCESS_TOKEN = Deno.env.get("LINE_CHANNEL_ACCESS_TOKEN");
    const LINE_TARGET_USER_ID = Deno.env.get("LINE_TARGET_USER_ID");

    if (!LINE_CHANNEL_ACCESS_TOKEN) {
      return new Response(JSON.stringify({ error: "LINE_CHANNEL_ACCESS_TOKEN not configured" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }
    if (!LINE_TARGET_USER_ID) {
      return new Response(JSON.stringify({ error: "LINE_TARGET_USER_ID not configured" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    const { type, order } = await req.json();

    let message = "";

    if (type === "new_order") {
      const itemNames = (order.items || [])
        .map((i: any) => `${i.product?.name || "สินค้า"} x${i.quantity}`)
        .join(", ");
      message = `🛒 ออเดอร์ใหม่!\n` +
        `เลขออเดอร์: ${order.order_number}\n` +
        `ลูกค้า: ${order.customer_name}\n` +
        `โทร: ${order.customer_phone}\n` +
        `สินค้า: ${itemNames}\n` +
        `ยอดรวม: ฿${Number(order.total).toLocaleString()}\n` +
        `ชำระผ่าน: ${order.payment_method}`;
    } else if (type === "status_update") {
      const statusMap: Record<string, string> = {
        pending: "รอชำระเงิน",
        paid: "ชำระเงินแล้ว",
        processing: "กำลังเตรียมจัดส่ง",
        shipping: "กำลังจัดส่ง",
        delivered: "จัดส่งสำเร็จ",
        failed: "ชำระเงินไม่สำเร็จ",
        refunded: "คืนเงินแล้ว",
      };
      message = `📦 อัปเดตสถานะออเดอร์\n` +
        `เลขออเดอร์: ${order.order_number}\n` +
        `ลูกค้า: ${order.customer_name}\n` +
        `สถานะ: ${statusMap[order.status] || order.status}`;
    } else {
      message = `📬 แจ้งเตือนจาก Dr.Arty\n${JSON.stringify(order).slice(0, 200)}`;
    }

    // Use LINE Messaging API (push message)
    const response = await fetch("https://api.line.me/v2/bot/message/push", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: LINE_TARGET_USER_ID,
        messages: [{ type: "text", text: message }],
      }),
    });

    const responseText = await response.text();
    let data;
    try { data = JSON.parse(responseText); } catch { data = responseText; }

    console.log("LINE Messaging API response:", response.status, data);

    return new Response(JSON.stringify({ success: response.ok, data }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: response.ok ? 200 : 500,
    });
  } catch (error) {
    console.error("LINE notify error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
