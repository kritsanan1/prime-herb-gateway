import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const BRAND_COLOR = "#D4AF37";
const BG_DARK = "#1a1a1a";
const BG_BODY = "#111111";
const ADMIN_URL = "https://prime-herb-gateway.lovable.app/admin";

function textBox(label: string, value: string, valueColor = "#ffffff") {
  return {
    type: "box", layout: "horizontal",
    contents: [
      { type: "text", text: label, color: "#888888", size: "sm", flex: 2 },
      { type: "text", text: value || "-", color: valueColor, size: "sm", flex: 4, align: "end" },
    ],
  };
}

function footerButton(label: string, uri: string) {
  return {
    type: "box", layout: "vertical", backgroundColor: BG_DARK, paddingAll: "md",
    contents: [{ type: "button", action: { type: "uri", label, uri }, style: "primary", color: BRAND_COLOR }],
  };
}

// ─── NEW ORDER ───
function buildNewOrderFlex(order: any): object {
  const itemNames = (order.items || []).map((i: any) => `${i.product?.name || "สินค้า"} x${i.quantity}`).join("\n");
  const paymentLabels: Record<string, string> = { promptpay: "PromptPay", credit_card: "บัตรเครดิต", bank_transfer: "โอนเงิน" };

  return {
    type: "flex", altText: `🛒 ออเดอร์ใหม่ ${order.order_number}`,
    contents: {
      type: "bubble", size: "mega",
      header: {
        type: "box", layout: "vertical", backgroundColor: BG_DARK, paddingAll: "lg",
        contents: [
          { type: "box", layout: "horizontal", alignItems: "center", contents: [
            { type: "text", text: "🛒", size: "xl", flex: 0 },
            { type: "text", text: "ออเดอร์ใหม่!", color: BRAND_COLOR, weight: "bold", size: "lg", flex: 1, margin: "md" },
          ]},
          { type: "text", text: order.order_number, color: "#ffffff", size: "sm", margin: "sm" },
        ],
      },
      body: {
        type: "box", layout: "vertical", backgroundColor: BG_BODY, paddingAll: "lg", spacing: "md",
        contents: [
          textBox("ลูกค้า", order.customer_name),
          textBox("โทร", order.customer_phone),
          { type: "separator", color: "#333333" },
          { type: "text", text: "สินค้า", color: BRAND_COLOR, size: "xs", weight: "bold" },
          { type: "text", text: itemNames || "-", color: "#cccccc", size: "sm", wrap: true },
          { type: "separator", color: "#333333" },
          textBox("ชำระผ่าน", paymentLabels[order.payment_method] || order.payment_method),
          { type: "box", layout: "horizontal", margin: "md", contents: [
            { type: "text", text: "ยอดรวม", color: BRAND_COLOR, size: "lg", weight: "bold", flex: 2 },
            { type: "text", text: `฿${Number(order.total).toLocaleString()}`, color: BRAND_COLOR, size: "lg", weight: "bold", flex: 4, align: "end" },
          ]},
        ],
      },
      footer: footerButton("ดูรายละเอียด", ADMIN_URL),
    },
  };
}

// ─── STATUS UPDATE ───
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
    type: "flex", altText: `📦 อัปเดต ${order.order_number}: ${s.label}`,
    contents: {
      type: "bubble", size: "kilo",
      header: {
        type: "box", layout: "vertical", backgroundColor: BG_DARK, paddingAll: "lg",
        contents: [{ type: "text", text: `${s.emoji} อัปเดตสถานะ`, color: BRAND_COLOR, weight: "bold", size: "md" }],
      },
      body: {
        type: "box", layout: "vertical", backgroundColor: BG_BODY, paddingAll: "lg", spacing: "sm",
        contents: [
          textBox("ออเดอร์", order.order_number || "-"),
          textBox("ลูกค้า", order.customer_name || "-"),
          { type: "separator", color: "#333333" },
          { type: "box", layout: "horizontal", margin: "md", contents: [
            { type: "text", text: "สถานะ", color: "#888888", size: "sm", flex: 2 },
            { type: "text", text: s.label, color: s.color, size: "md", weight: "bold", flex: 4, align: "end" },
          ]},
        ],
      },
      footer: footerButton("ดูรายละเอียด", ADMIN_URL),
    },
  };
}

// ─── PROGRESS UPDATE ───
function buildProgressFlex(data: any): object {
  const pct = data.percentage || 0;
  const barFilled = Math.round(pct / 10);
  const bar = "█".repeat(barFilled) + "░".repeat(10 - barFilled);

  return {
    type: "flex", altText: `📊 อัปเดตความคืบหน้า: ${data.title}`,
    contents: {
      type: "bubble", size: "mega",
      header: {
        type: "box", layout: "vertical", backgroundColor: BG_DARK, paddingAll: "lg",
        contents: [
          { type: "box", layout: "horizontal", alignItems: "center", contents: [
            { type: "text", text: "📊", size: "xl", flex: 0 },
            { type: "text", text: "อัปเดตความคืบหน้า", color: BRAND_COLOR, weight: "bold", size: "lg", flex: 1, margin: "md" },
          ]},
        ],
      },
      body: {
        type: "box", layout: "vertical", backgroundColor: BG_BODY, paddingAll: "lg", spacing: "md",
        contents: [
          { type: "text", text: data.title || "งานที่กำลังดำเนินการ", color: "#ffffff", size: "md", weight: "bold", wrap: true },
          { type: "separator", color: "#333333" },
          ...(data.tasks || []).map((task: any) => ({
            type: "box", layout: "horizontal",
            contents: [
              { type: "text", text: task.done ? "✅" : "⬜", size: "sm", flex: 0 },
              { type: "text", text: task.name, color: task.done ? "#27AE60" : "#cccccc", size: "sm", flex: 5, margin: "sm", wrap: true },
            ],
          })),
          { type: "separator", color: "#333333" },
          { type: "text", text: `ความคืบหน้า ${pct}%`, color: BRAND_COLOR, size: "sm", weight: "bold" },
          { type: "text", text: bar, color: BRAND_COLOR, size: "sm" },
          ...(data.note ? [{ type: "text", text: `📝 ${data.note}`, color: "#888888", size: "xs", wrap: true, margin: "md" }] : []),
        ],
      },
      footer: footerButton("ดูรายละเอียด", ADMIN_URL),
    },
  };
}

// ─── SOCIAL MEDIA APPROVAL ───
function buildSocialApprovalFlex(data: any): object {
  const platformEmoji: Record<string, string> = {
    facebook: "📘", instagram: "📸", tiktok: "🎵", youtube: "▶️", line: "💬", twitter: "🐦",
  };
  const emoji = platformEmoji[data.platform?.toLowerCase()] || "📱";

  const contents: any[] = [
    { type: "text", text: data.caption || "ไม่ระบุ caption", color: "#ffffff", size: "sm", wrap: true },
    { type: "separator", color: "#333333" },
    textBox("แพลตฟอร์ม", `${emoji} ${data.platform || "ไม่ระบุ"}`),
    textBox("กำหนดโพสต์", data.scheduled_at || "ยังไม่กำหนด"),
  ];

  if (data.hashtags) {
    contents.push({ type: "text", text: data.hashtags, color: "#3498DB", size: "xs", wrap: true, margin: "md" });
  }

  if (data.image_url) {
    contents.unshift({ type: "image", url: data.image_url, size: "full", aspectRatio: "16:9", aspectMode: "cover" });
  }

  return {
    type: "flex", altText: `📱 ขออนุมัติโพสต์: ${data.platform}`,
    contents: {
      type: "bubble", size: "mega",
      header: {
        type: "box", layout: "vertical", backgroundColor: BG_DARK, paddingAll: "lg",
        contents: [
          { type: "box", layout: "horizontal", alignItems: "center", contents: [
            { type: "text", text: "📱", size: "xl", flex: 0 },
            { type: "text", text: "ขออนุมัติโพสต์", color: BRAND_COLOR, weight: "bold", size: "lg", flex: 1, margin: "md" },
          ]},
          { type: "text", text: `โดย: ${data.author || "ทีมงาน"}`, color: "#888888", size: "xs", margin: "sm" },
        ],
      },
      body: {
        type: "box", layout: "vertical", backgroundColor: BG_BODY, paddingAll: "lg", spacing: "md",
        contents,
      },
      footer: {
        type: "box", layout: "horizontal", backgroundColor: BG_DARK, paddingAll: "md", spacing: "sm",
        contents: [
          { type: "button", action: { type: "uri", label: "✅ อนุมัติ", uri: data.approve_url || ADMIN_URL }, style: "primary", color: "#27AE60", flex: 1 },
          { type: "button", action: { type: "uri", label: "❌ แก้ไข", uri: data.edit_url || ADMIN_URL }, style: "primary", color: "#E74C3C", flex: 1 },
        ],
      },
    },
  };
}

// ─── MAIN HANDLER ───
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LINE_CHANNEL_ACCESS_TOKEN = Deno.env.get("LINE_CHANNEL_ACCESS_TOKEN");
    const LINE_TARGET_USER_ID = Deno.env.get("LINE_TARGET_USER_ID");

    if (!LINE_CHANNEL_ACCESS_TOKEN) {
      return new Response(JSON.stringify({ error: "LINE_CHANNEL_ACCESS_TOKEN not configured" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500,
      });
    }
    if (!LINE_TARGET_USER_ID) {
      return new Response(JSON.stringify({ error: "LINE_TARGET_USER_ID not configured" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500,
      });
    }

    const { type, order, data } = await req.json();
    let message: object;

    switch (type) {
      case "new_order":
        message = buildNewOrderFlex(order);
        break;
      case "status_update":
        message = buildStatusUpdateFlex(order);
        break;
      case "progress_update":
        message = buildProgressFlex(data || order);
        break;
      case "social_approval":
        message = buildSocialApprovalFlex(data || order);
        break;
      default:
        message = { type: "text", text: `📬 แจ้งเตือนจาก Dr.Arty\n${JSON.stringify(order || data).slice(0, 300)}` };
    }

    const response = await fetch("https://api.line.me/v2/bot/message/push", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ to: LINE_TARGET_USER_ID, messages: [message] }),
    });

    const responseText = await response.text();
    let responseData;
    try { responseData = JSON.parse(responseText); } catch { responseData = responseText; }
    console.log("LINE Messaging API response:", response.status, responseData);

    return new Response(JSON.stringify({ success: response.ok, data: responseData }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }, status: response.ok ? 200 : 500,
    });
  } catch (error) {
    console.error("LINE notify error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500,
    });
  }
});
