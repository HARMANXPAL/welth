import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

export default function EmailTemplate({
  userName = "",
  type = "budget-alert",
  data = {},
}) {
  if (type === "monthly-report") {
    return (
      <Html>
        <Head />
        <Preview>Your Monthly Financial Report</Preview>
        <Body style={styles.body}>
          <Container style={styles.container}>
            <Heading style={styles.title}>Monthly Financial Report</Heading>
            <Text style={styles.text}>Hello {userName},</Text>
            <Text style={styles.text}>
              Here&rsquo;s your financial summary for {data?.month}:
            </Text>
            <Section style={styles.statsContainer}>
              <div style={styles.stat}>
                <Text style={styles.statLabel}>Total Income</Text>
                <Text style={styles.statValue}>${data?.stats?.totalIncome}</Text>
              </div>
              <div style={styles.stat}>
                <Text style={styles.statLabel}>Total Expenses</Text>
                <Text style={styles.statValue}>${data?.stats?.totalExpenses}</Text>
              </div>
              <div style={styles.stat}>
                <Text style={styles.statLabel}>Net</Text>
                <Text style={styles.statValue}>${data?.stats?.totalIncome - data?.stats?.totalExpenses}</Text>
              </div>
            </Section>
            {data?.stats?.byCategory && (
              <Section style={styles.section}>
                <Heading style={styles.sectionTitle}>Expenses by Category</Heading>
                {Object.entries(data?.stats?.byCategory).map(([category, amount]) => (
                  <div key={category} style={styles.row}>
                    <Text style={styles.text}>{category}</Text>
                    <Text style={styles.text}>${amount}</Text>
                  </div>
                ))}
              </Section>
            )}
            {data?.insights && (
              <Section style={styles.section}>
                <Heading style={styles.sectionTitle}>Welth Insights</Heading>
                {data.insights.map((insight, index) => (
                  <Text key={index} style={styles.insight}>
                    {insight}
                  </Text>
                ))}
              </Section>
            )}
          </Container>
        </Body>
      </Html>
    );
  }

  if (type === "budget-alert") {
    return (
      <Html>
        <Head />
        <Preview>Budget Alert</Preview>
        <Body style={styles.body}>
          <Container style={styles.container}>
            <Heading style={styles.title}>Budget Alert</Heading>
            <Text style={styles.text}>Hello {userName},</Text>
            <Text style={styles.text}>
              You have used {data?.percentageUsed?.toFixed(1)}% of your monthly
              budget.
            </Text>
            <Section style={styles.statsContainer}>
              <div style={styles.stat}>
                <Text style={styles.statLabel}>Budget Amount</Text>
                <Text style={styles.statValue}>${data?.budgetAmount}</Text>
              </div>
              <div style={styles.stat}>
                <Text style={styles.statLabel}>Spent So Far</Text>
                <Text style={styles.statValue}>${data?.totalExpenses}</Text>
              </div>
              <div style={styles.stat}>
                <Text style={styles.statLabel}>Remaining</Text>
                <Text style={styles.statValue}>
                  ${data?.budgetAmount - data?.totalExpenses}
                </Text>
              </div>
            </Section>
          </Container>
        </Body>
      </Html>
    );
  }
}

const styles = {
  body: { backgroundColor: "#f6f9fc", fontFamily: "Arial, sans-serif" },
  container: {
    backgroundColor: "#ffffff",
    margin: "0 auto",
    padding: "20px",
    borderRadius: "5px",
    maxWidth: "600px",
  },
  title: { color: "#1a1a1a", fontSize: "24px", fontWeight: "bold", margin: "0 0 20px" },
  text: { color: "#333333", fontSize: "16px", margin: "0 0 16px" },
  statsContainer: {
    margin: "20px 0",
    padding: "20px",
    backgroundColor: "#f8fafc",
    borderRadius: "5px",
  },
  stat: { margin: "10px 0", padding: "10px", backgroundColor: "#ffffff", borderRadius: "3px" },
  statLabel: { color: "#666666", fontSize: "14px", margin: "0 0 4px" },
  statValue: { color: "#1a1a1a", fontSize: "20px", fontWeight: "bold", margin: "0" },
  section: { margin: "20px 0" },
  sectionTitle: { color: "#1a1a1a", fontSize: "18px", fontWeight: "bold", margin: "0 0 12px" },
  row: { display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f0f0f0" },
  insight: { color: "#333333", fontSize: "14px", margin: "0 0 8px", padding: "8px", backgroundColor: "#f8fafc", borderRadius: "3px" },
};