import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function buildNewOrderFlex(order: any): object {
  const itemNames = (order.items || [])
    .map((i: any) => `${i.product?.name || "สินค้า"} x${i.quantity}`)
    .join("\n");

  const paymentLabels: Record<string, string> = {
    promptpay: "PromptPay",
    credit_card: "บัตรเครดิต",
    bank_transfer: "โอนเงิน",
  };

  return {
    type: "flex",
    altText: `🛒 ออเดอร์ใหม่ ${order.order_number}`,
    contents: {
      type: "bubble",
      size: "mega",
      header: {
        type: "box",
        layout: "vertical",
        backgroundColor: "#1a1a1a",
        paddingAll: "lg",
        contents: [
          {
            type: "box",
            layout: "horizontal",
            contents: [
              { type: "text", text: "🛒", size: "xl", flex: 0 },
              {
                type: "text",
                text: "ออเดอร์ใหม่!",
                color: "#D4AF37",
                weight: "bold",
                size: "lg",
                flex: 1,
                margin: "md",
              },
            ],
            alignItems: "center",
          },
          {
            type: "text",
            text: order.order_number,
            color: "#ffffff",
            size: "sm",
            margin: "sm",
          },
        ],
      },
      body: {
        type: "box",
        layout: "vertical",
        backgroundColor: "#111111",
        paddingAll: "lg",
        spacing: "md",
        contents: [
          {
            type: "box",
            layout: "horizontal",
            contents: [
              { type: "text", text: "ลูกค้า", color: "#888888", size: "sm", flex: 2 },
              { type: "text", text: order.customer_name || "-", color: "#ffffff", size: "sm", flex: 4, align: "end" },
            ],
          },
          {
            type: "box",
            layout: "horizontal",
            contents: [
              { type: "text", text: "โทร", color: "#888888", size: "sm", flex: 2 },
              { type: "text", text: order.customer_phone || "-", color: "#ffffff", size: "sm", flex: 4, align: "end" },
            ],
          },
          { type: "separator", color: "#333333" },
          {
            type: "text",
            text: "สินค้า",
            color: "#D4AF37",
            size: "xs",
            weight: "bold",
          },
          {
            type: "text",
            text: itemNames || "-",
            color: "#cccccc",
            size: "sm",
            wrap: true,
          },
          { type: "separator", color: "#333333" },
          {
            type: "box",
            layout: "horizontal",
            contents: [
              { type: "text", text: "ชำระผ่าน", color: "#888888", size: "sm", flex: 2 },
              { type: "text", text: paymentLabels[order.payment_method] || order.payment_method, color: "#ffffff", size: "sm", flex: 4, align: "end" },
            ],
          },
          {
            type: "box",
            layout: "horizontal",
            margin: "md",
            contents: [
              { type: "text", text: "ยอดรวม", color: "#D4AF37", size: "lg", weight: "bold", flex: 2 },
              { type: "text", text: `฿${Number(order.total).toLocaleString()}`, color: "#D4AF37", size: "lg", weight: "bold", flex: 4, align: "end" },
            ],
          },
        ],
      },
      footer: {
        type: "box",
        layout: "vertical",
        backgroundColor: "#1a1a1a",
        paddingAll: "md",
        contents: [
          {
            type: "button",
            action: {
              type: "uri",
              label: "ดูรายละเอียด",
              uri: `https://prime-herb-gateway.lovable.app/admin`,
            },
            style: "primary",
            color: "#D4AF37",
          },
        ],
      },
    },
  };
}

function buildStatusUpdateFlex(order: any): object {
  const statusMap: Record<string, { label: string; emoji: string; color: string }> = {
    pending: { label: "รอชำระเงิน", emoji: "⏳", color: "#888888" },
    paid: { label: "ชำระเงินแล้ว", emoji: "✅", color: "#27AE60" },
    processing: { label: "กำลังเตรียมจัดส่ง", emoji: "📦", color: "#F39C12" },
    shipping: { label: "กำลังจัดส่ง", emoji: "🚚", color: "#3498DB" },
    delivered: { label: "จัดส่งสำเร็จ", emoji: "🎉", color: "#27AE60" },
    failed: { label: "ชำระเงินไม่สำเร็จ", emoji: "❌", color: "#E74C3C" },
    refunded: { label: "คืนเงินแล้ว", emoji: "💰", color: "#9B59B6" },
  };

  const s = statusMap[order.status] || { label: order.status, emoji: "📋", color: "#888888" };

  return {
    type: "flex",
    altText: `📦 อัปเดต ${order.order_number}: ${s.label}`,
    contents: {
      type: "bubble",
      size: "kilo",
      header: {
        type: "box",
        layout: "vertical",
        backgroundColor: "#1a1a1a",
        paddingAll: "lg",
        contents: [
          {
            type: "text",
            text: `${s.emoji} อัปเดตสถานะ`,
            color: "#D4AF37",
            weight: "bold",
            size: "md",
          },
        ],
      },
      body: {
        type: "box",
        layout: "vertical",
        backgroundColor: "#111111",
        paddingAll: "lg",
        spacing: "sm",
        contents: [
          {
            type: "box",
            layout: "horizontal",
            contents: [
              { type: "text", text: "ออเดอร์", color: "#888888", size: "sm", flex: 2 },
              { type: "text", text: order.order_number || "-", color: "#ffffff", size: "sm", flex: 4, align: "end" },
            ],
          },
          {
            type: "box",
            layout: "horizontal",
            contents: [
              { type: "text", text: "ลูกค้า", color: "#888888", size: "sm", flex: 2 },
              { type: "text", text: order.customer_name || "-", color: "#ffffff", size: "sm", flex: 4, align: "end" },
            ],
          },
          { type: "separator", color: "#333333" },
          {
            type: "box",
            layout: "horizontal",
            margin: "md",
            contents: [
              { type: "text", text: "สถานะ", color: "#888888", size: "sm", flex: 2 },
              { type: "text", text: s.label, color: s.color, size: "md", weight: "bold", flex: 4, align: "end" },
            ],
          },
        ],
      },
      footer: {
        type: "box",
        layout: "vertical",
        backgroundColor: "#1a1a1a",
        paddingAll: "md",
        contents: [
          {
            type: "button",
            action: {
              type: "uri",
              label: "ดูรายละเอียด",
              uri: `https://prime-herb-gateway.lovable.app/admin`,
            },
            style: "primary",
            color: "#D4AF37",
          },
        ],
      },
    },
  };
}

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

    let message: object;

    if (type === "new_order") {
      message = buildNewOrderFlex(order);
    } else if (type === "status_update") {
      message = buildStatusUpdateFlex(order);
    } else {
      message = {
        type: "text",
        text: `📬 แจ้งเตือนจาก Dr.Arty\n${JSON.stringify(order).slice(0, 300)}`,
      };
    }

    const response = await fetch("https://api.line.me/v2/bot/message/push", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: LINE_TARGET_USER_ID,
        messages: [message],
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
