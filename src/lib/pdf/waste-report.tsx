import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";

interface WasteRow {
  wasteCode: string;
  wasteName: string;
  hazardClass: string;
  amountStart: string;
  amountGenerated: string;
  amountReceived: string;
  amountUsed: string;
  amountTransferred: string;
  amountPlaced: string;
  amountEnd: string;
}

interface WasteReportProps {
  organizationName: string;
  facilityName: string;
  facilityAddress: string;
  year: number;
  rows: WasteRow[];
}

const styles = StyleSheet.create({
  page: { padding: 30, fontFamily: "Helvetica", fontSize: 9 },
  title: { fontSize: 12, fontFamily: "Helvetica-Bold", marginBottom: 8, textAlign: "center" },
  subtitle: { fontSize: 9, textAlign: "center", marginBottom: 16, color: "#555" },
  infoRow: { flexDirection: "row", marginBottom: 4 },
  infoLabel: { width: 120, fontFamily: "Helvetica-Bold" },
  infoValue: { flex: 1 },
  table: { marginTop: 12 },
  tableHeader: { flexDirection: "row", backgroundColor: "#e8f5e9", borderBottom: 1, borderColor: "#aaa" },
  tableRow: { flexDirection: "row", borderBottom: 0.5, borderColor: "#ddd" },
  cell: { padding: "3 4", borderRight: 0.5, borderColor: "#ddd" },
  cellCode: { width: 80 },
  cellName: { flex: 1 },
  cellClass: { width: 30, textAlign: "center" },
  cellNum: { width: 45, textAlign: "right" },
  footer: { marginTop: 20, fontSize: 8, color: "#888" },
});

export function WasteReportPdf({
  organizationName,
  facilityName,
  facilityAddress,
  year,
  rows,
}: WasteReportProps) {
  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <Text style={styles.title}>
          Форма № 2-ТП (отходы) за {year} год
        </Text>
        <Text style={styles.subtitle}>
          Сведения об образовании, обработке, утилизации, обезвреживании, размещении отходов производства и потребления
        </Text>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Организация:</Text>
          <Text style={styles.infoValue}>{organizationName}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Объект:</Text>
          <Text style={styles.infoValue}>{facilityName}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Адрес:</Text>
          <Text style={styles.infoValue}>{facilityAddress}</Text>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.cell, styles.cellCode]}>Код ФККО</Text>
            <Text style={[styles.cell, styles.cellName]}>Наименование отхода</Text>
            <Text style={[styles.cell, styles.cellClass]}>Кл.</Text>
            <Text style={[styles.cell, styles.cellNum]}>Нач., т</Text>
            <Text style={[styles.cell, styles.cellNum]}>Образ., т</Text>
            <Text style={[styles.cell, styles.cellNum]}>Получ., т</Text>
            <Text style={[styles.cell, styles.cellNum]}>Исп., т</Text>
            <Text style={[styles.cell, styles.cellNum]}>Пер., т</Text>
            <Text style={[styles.cell, styles.cellNum]}>Разм., т</Text>
            <Text style={[styles.cell, styles.cellNum]}>Кон., т</Text>
          </View>

          {rows.map((row, i) => (
            <View key={i} style={styles.tableRow}>
              <Text style={[styles.cell, styles.cellCode]}>{row.wasteCode}</Text>
              <Text style={[styles.cell, styles.cellName]}>{row.wasteName}</Text>
              <Text style={[styles.cell, styles.cellClass]}>{row.hazardClass}</Text>
              <Text style={[styles.cell, styles.cellNum]}>{row.amountStart}</Text>
              <Text style={[styles.cell, styles.cellNum]}>{row.amountGenerated}</Text>
              <Text style={[styles.cell, styles.cellNum]}>{row.amountReceived}</Text>
              <Text style={[styles.cell, styles.cellNum]}>{row.amountUsed}</Text>
              <Text style={[styles.cell, styles.cellNum]}>{row.amountTransferred}</Text>
              <Text style={[styles.cell, styles.cellNum]}>{row.amountPlaced}</Text>
              <Text style={[styles.cell, styles.cellNum]}>{row.amountEnd}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.footer}>
          Сформировано: {new Date().toLocaleDateString("ru-RU")} | ЭкоОтчёт
        </Text>
      </Page>
    </Document>
  );
}
