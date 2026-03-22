import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const ADMIN_EMAIL = "admin@drarty.com";

function buildOrderEmailHtml(order: any, type: string): { subject: string; html: string } {
  const statusLabels: Record<string, string> = {
    pending: "รอชำระเงิน",
    paid: "ชำระเงินแล้ว",
    processing: "กำลังเตรียมจัดส่ง",
    shipping: "กำลังจัดส่ง",
    delivered: "จัดส่งสำเร็จ",
    failed: "ชำระเงินไม่สำเร็จ",
    refunded: "คืนเงินแล้ว",
  };

  const orderNumber = order.order_number;
  const total = Number(order.total).toLocaleString();
  const status = statusLabels[order.status] || order.status;

  const baseStyle = `
    font-family: 'Helvetica Neue', Arial, sans-serif;
    background-color: #0a0a0a;
    color: #e5e5e5;
  `;

  const cardStyle = `
    background: linear-gradient(135deg, #1a1a1a 0%, #111 100%);
    border: 1px solid #333;
    border-radius: 12px;
    padding: 32px;
    max-width: 560px;
    margin: 32px auto;
  `;

  const goldText = `color: #d4a853; font-weight: bold;`;

  let subject = "";
  let bodyContent = "";

  switch (type) {
    case "new_order":
      subject = `[Dr.Arty] คำสั่งซื้อใหม่ #${orderNumber}`;
      bodyContent = `
        <h2 style="${goldText} font-size: 20px; margin-bottom: 16px;">📦 คำสั่งซื้อใหม่</h2>
        <p>เลขออเดอร์: <strong>${orderNumber}</strong></p>
        <p>ลูกค้า: ${order.customer_name}</p>
        <p>โทร: ${order.customer_phone}</p>
        <p>อีเมล: ${order.customer_email}</p>
        <p>ที่อยู่: ${order.customer_address}, ${order.province} ${order.postal_code}</p>
        <hr style="border-color: #333; margin: 16px 0;" />
        <p>ยอดรวม: <span style="${goldText}">฿${total}</span></p>
        <p>วิธีชำระ: ${order.payment_method}</p>
        <p>สถานะ: ${status}</p>
      `;
      break;

    case "payment_success":
      subject = `Dr.Arty Prime Herb — ชำระเงินสำเร็จ #${orderNumber}`;
      bodyContent = `
        <h2 style="${goldText} font-size: 20px; margin-bottom: 16px;">✅ ชำระเงินสำเร็จ</h2>
        <p>ขอบคุณสำหรับคำสั่งซื้อ</p>
        <p>เลขออเดอร์: <strong>${orderNumber}</strong></p>
        <p>ยอดชำระ: <span style="${goldText}">฿${total}</span></p>
        <hr style="border-color: #333; margin: 16px 0;" />
        <p style="font-size: 13px; color: #888;">สินค้าจะจัดส่งภายใน 1-2 วันทำการ คุณสามารถติดตามสถานะได้ที่หน้า "ติดตามคำสั่งซื้อ" บนเว็บไซต์</p>
      `;
      break;

    case "status_update":
      subject = `Dr.Arty — อัปเดตสถานะออเดอร์ #${orderNumber}`;
      bodyContent = `
        <h2 style="${goldText} font-size: 20px; margin-bottom: 16px;">📋 อัปเดตสถานะคำสั่งซื้อ</h2>
        <p>เลขออเดอร์: <strong>${orderNumber}</strong></p>
        <p>สถานะใหม่: <span style="${goldText}">${status}</span></p>
        ${order.tracking_number ? `<p>หมายเลขติดตาม: ${order.tracking_number}</p>` : ""}
        <hr style="border-color: #333; margin: 16px 0;" />
        <p style="font-size: 13px; color: #888;">ติดตามคำสั่งซื้อได้ที่เว็บไซต์ drarty.com</p>
      `;
      break;

    default:
      subject = `Dr.Arty — แจ้งเตือนออเดอร์ #${orderNumber}`;
      bodyContent = `<p>สถานะ: ${status}</p>`;
  }

  const html = `
    <!DOCTYPE html>
    <html>
    <body style="${baseStyle} margin: 0; padding: 0;">
      <div style="${cardStyle}">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="${goldText} font-size: 24px; margin: 0;">Dr.Arty Prime Herb</h1>
          <p style="color: #888; font-size: 12px; margin: 4px 0 0;">มั่นใจอย่างมีระดับ</p>
        </div>
        ${bodyContent}
      </div>
      <p style="text-align: center; font-size: 11px; color: #555; padding: 16px;">
        © ${new Date().getFullYear()} Dr.Arty Prime Herb — อีเมลนี้ส่งอัตโนมัติ กรุณาอย่าตอบกลับ
      </p>
    </body>
    </html>
  `;

  return { subject, html };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, order } = await req.json();

    if (!order || !type) {
      throw new Error("Missing type or order data");
    }

    const { subject, html } = buildOrderEmailHtml(order, type);

    // Determine recipients
    const recipients: string[] = [];
    if (type === "new_order") {
      recipients.push(ADMIN_EMAIL);
    } else {
      if (order.customer_email) recipients.push(order.customer_email);
    }

    // Also notify admin for payment success
    if (type === "payment_success") {
      recipients.push(ADMIN_EMAIL);
    }

    // Use Supabase's built-in email or log for now
    // This is a placeholder - will use transactional email infrastructure
    console.log(`📧 Sending ${type} email to: ${recipients.join(", ")}`);
    console.log(`Subject: ${subject}`);

    // Try to use the transactional email function if available
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (supabaseUrl && serviceKey) {
      for (const to of recipients) {
        try {
          await fetch(`${supabaseUrl}/functions/v1/send-transactional-email`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${serviceKey}`,
            },
            body: JSON.stringify({ to, subject, html }),
          });
        } catch (e) {
          console.log(`Email to ${to} queued (transactional email not yet configured):`, e.message);
        }
      }
    }

    return new Response(JSON.stringify({ success: true, recipients }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Send order email error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
