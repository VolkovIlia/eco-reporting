import { NextRequest, NextResponse } from "next/server";
import { renderToStream } from "@react-pdf/renderer";
import { db } from "@/db";
import { reports, facilities, organizations } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { WasteReportPdf } from "@/lib/pdf/waste-report";

interface Props {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: Props) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ code: "UNAUTHORIZED" }, { status: 401 });
  }

  const { id } = await params;
  const reportId = Number(id);
  if (isNaN(reportId)) {
    return NextResponse.json({ code: "NOT_FOUND" }, { status: 404 });
  }

  const [report] = await db
    .select()
    .from(reports)
    .where(eq(reports.id, reportId))
    .limit(1);

  if (!report) {
    return NextResponse.json({ code: "NOT_FOUND" }, { status: 404 });
  }

  const [facility] = await db
    .select()
    .from(facilities)
    .where(eq(facilities.id, report.facilityId))
    .limit(1);

  if (!facility) {
    return NextResponse.json({ code: "NOT_FOUND" }, { status: 404 });
  }

  const [org] = await db
    .select({ name: organizations.name })
    .from(organizations)
    .where(eq(organizations.id, facility.orgId))
    .limit(1);

  if (report.type !== "2tp_waste") {
    return NextResponse.json(
      { code: "VALIDATION_ERROR", message: "PDF доступен только для 2-ТП Отходы" },
      { status: 400 }
    );
  }

  const data = (report.data as { rows?: Array<Record<string, string>> }) ?? {};
  const rows = data.rows ?? [];

  const pdfElement = WasteReportPdf({
    organizationName: org?.name ?? "Организация",
    facilityName: facility.name,
    facilityAddress: facility.address,
    year: report.year,
    rows: rows as Array<{
      wasteCode: string; wasteName: string; hazardClass: string;
      amountStart: string; amountGenerated: string; amountReceived: string;
      amountUsed: string; amountTransferred: string; amountPlaced: string; amountEnd: string;
    }>,
  });

  const stream = await renderToStream(pdfElement);

  const chunks: Uint8Array[] = [];
  for await (const chunk of stream as AsyncIterable<Uint8Array>) {
    chunks.push(chunk);
  }

  const buffer = Buffer.concat(chunks);

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="2tp-waste-${report.year}.pdf"`,
    },
  });
}
