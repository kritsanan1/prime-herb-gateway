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
    const LINE_NOTIFY_TOKEN = Deno.env.get("LINE_NOTIFY_TOKEN");
    if (!LINE_NOTIFY_TOKEN) {
      return new Response(JSON.stringify({ error: "LINE_NOTIFY_TOKEN not configured" }), {
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
      message = `\n🛒 ออเดอร์ใหม่!\n` +
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
      message = `\n📦 อัปเดตสถานะออเดอร์\n` +
        `เลขออเดอร์: ${order.order_number}\n` +
        `ลูกค้า: ${order.customer_name}\n` +
        `สถานะ: ${statusMap[order.status] || order.status}`;
    } else {
      message = `\n📬 แจ้งเตือนจาก Dr.Arty\n${JSON.stringify(order).slice(0, 200)}`;
    }

    const response = await fetch("https://notify-api.line.me/api/notify", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LINE_NOTIFY_TOKEN}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ message }),
    });

    const data = await response.json();

    return new Response(JSON.stringify({ success: response.ok, data }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: response.ok ? 200 : 500,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
