import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";
import crypto from "crypto";

// Generate PDF from HTML
export async function generatePDF(html: string): Promise<Buffer> {
  let browser = null;

  try {
    // Launch browser
    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: {
        width: 1920,
        height: 1080,
      },
      executablePath: await chromium.executablePath(),
      headless: true,
    });

    const page = await browser.newPage();
    
    // Set content
    await page.setContent(html, {
      waitUntil: "networkidle0",
    });

    // Generate PDF
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "20mm",
        right: "15mm",
        bottom: "20mm",
        left: "15mm",
      },
    });

    return Buffer.from(pdf);
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw new Error("Failed to generate PDF");
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Generate SHA-256 hash of PDF
export function generatePDFHash(pdfBuffer: Buffer): string {
  return crypto.createHash("sha256").update(pdfBuffer).digest("hex");
}

// Save PDF to file system (for development)
// In production, this should upload to Vercel Blob or S3
export async function savePDF(pdfBuffer: Buffer, filename: string): Promise<string> {
  // For MVP, we'll return a mock URL
  // In production, upload to blob storage and return the URL
  const hash = generatePDFHash(pdfBuffer);
  
  // TODO: Upload to Vercel Blob or S3
  // const blob = await put(`contracts/${filename}`, pdfBuffer, {
  //   access: 'public',
  //   contentType: 'application/pdf',
  // });
  // return blob.url;
  
  // For now, return a mock URL with hash for verification
  return `/api/contracts/pdf/${filename}?hash=${hash}`;
}

