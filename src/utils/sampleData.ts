export interface SampleOption {
  id: string;
  title: string;
  description: string;
  rows: number;
  columns: number;
  badge: string;
  getData: () => Record<string, any>[];
}

export const SAMPLE_DATASETS: SampleOption[] = [
  {
    id: 'ecommerce',
    title: 'Global E-Commerce Retail & Profit',
    description: '120 international orders across electronics, apparel, and home goods with revenue, profit margins, discounts, and regional distribution.',
    rows: 120,
    columns: 10,
    badge: 'Sales & Revenue',
    getData: () => getEcommerceData(),
  },
  {
    id: 'workforce',
    title: 'Enterprise Tech HR & Compensation',
    description: '100 engineering, product, and sales employees with tenure, salary bands, performance rating, remote status, and hire dates.',
    rows: 100,
    columns: 8,
    badge: 'Human Resources',
    getData: () => getWorkforceData(),
  },
  {
    id: 'saas',
    title: 'Cloud SaaS Product & Subscriptions',
    description: '110 B2B customer accounts tracking MRR, plan tiers, active user seats, Net Promoter Score (NPS), churn probability, and billing cycle.',
    rows: 110,
    columns: 8,
    badge: 'SaaS Metrics',
    getData: () => getSaasData(),
  },
];

function getEcommerceData(): Record<string, any>[] {
  const regions = ['North America', 'Europe', 'Asia Pacific', 'Latin America', 'Middle East'];
  const categories = ['Electronics', 'Home & Kitchen', 'Apparel', 'Office Supplies', 'Fitness & Outdoors'];
  const products: Record<string, string[]> = {
    Electronics: ['Wireless Noise-Canceling Headphones', 'Smart 4K Monitor', 'Ultra-Slim Mechanical Keyboard', 'USB-C Docking Station', 'High-Speed Portable SSD'],
    'Home & Kitchen': ['Espresso Barista Machine', 'Air Fryer Touch', 'Ceramic Cookware Set', 'Smart Air Purifier', 'Robot Vacuum Cleaner'],
    Apparel: ['Merino Wool Cardigan', 'All-Weather Trench Coat', 'Performance Running Shoes', 'Waterproof Trail Pants', 'Tailored Oxford Shirt'],
    'Office Supplies': ['Ergonomic Mesh Chair', 'Electric Standing Desk', 'Monitor Arm Mount', 'Document Shredder Pro', 'Acoustic Desk Divider'],
    'Fitness & Outdoors': ['Adjustable Dumbbell Set', 'Smart Fitness Watch', 'Hydro Insulated Bottle', 'Yoga Mat High Density', 'Resistance Band Kit'],
  };
  const statuses = ['Delivered', 'Delivered', 'Delivered', 'Shipped', 'Processing', 'Cancelled'];

  const rows: Record<string, any>[] = [];
  const startDate = new Date(2025, 0, 1).getTime();

  for (let i = 1; i <= 120; i++) {
    const region = regions[i % regions.length];
    const category = categories[i % categories.length];
    const catProducts = products[category];
    const product = catProducts[i % catProducts.length];
    const units = (i % 7) + 1;
    const basePrice = 25 + ((i * 19) % 350);
    const discount = (i % 5 === 0 ? 0.15 : i % 3 === 0 ? 0.05 : 0.0);
    const revenue = Math.round(units * basePrice * (1 - discount));
    const cost = Math.round(revenue * (0.45 + ((i % 20) / 100)));
    const profit = revenue - cost;
    const randomDays = (i * 3) % 360;
    const date = new Date(startDate + randomDays * 86400000).toISOString().slice(0, 10);
    const status = statuses[i % statuses.length];

    rows.push({
      'Order ID': `ORD-${1000 + i}`,
      'Order Date': date,
      'Region': region,
      'Product Category': category,
      'Product Name': product,
      'Units Sold': units,
      'Unit Price': basePrice,
      'Revenue ($)': revenue,
      'Profit ($)': profit,
      'Delivery Status': status,
    });
  }

  return rows;
}

function getWorkforceData(): Record<string, any>[] {
  const departments = ['Engineering', 'Product Management', 'Data & Analytics', 'Sales & BD', 'Customer Success', 'Design'];
  const roles: Record<string, string[]> = {
    Engineering: ['Senior Frontend Engineer', 'Staff Backend Architect', 'DevOps Specialist', 'Full-Stack Developer', 'QA Automation Lead'],
    'Product Management': ['Principal Product Manager', 'Growth PM', 'Technical PM', 'Associate Product Manager'],
    'Data & Analytics': ['Data Scientist', 'BI Analytics Engineer', 'Machine Learning Engineer', 'Data Analyst'],
    'Sales & BD': ['Enterprise Account Exec', 'Sales Development Rep', 'Solutions Architect', 'Account Director'],
    'Customer Success': ['Senior CSM', 'Onboarding Specialist', 'Support Engineer Lead', 'Client Strategist'],
    Design: ['Lead Product Designer', 'UX Researcher', 'Design Systems Engineer', 'Brand Visual Designer'],
  };
  const names = [
    'Elena Rostova', 'Marcus Chen', 'Amara Patel', 'David Kim', 'Sophia Al-Mansoor',
    'Liam O\'Connor', 'Chloe Martin', 'Javier Santos', 'Ananya Gupta', 'Lucas Schmidt',
    'Grace Hopper', 'Ada Lovelace', 'Alan Turing', 'Margaret Hamilton', 'Claude Shannon',
    'Katherine Johnson', 'Linus Torvalds', 'Tim Berners-Lee', 'Barbara Liskov', 'Ken Thompson'
  ];

  const rows: Record<string, any>[] = [];
  const baseHireDate = new Date(2019, 2, 1).getTime();

  for (let i = 1; i <= 100; i++) {
    const name = `${names[i % names.length]} ${String.fromCharCode(65 + (i % 26))}.`;
    const dept = departments[i % departments.length];
    const deptRoles = roles[dept];
    const role = deptRoles[i % deptRoles.length];
    const experienceYears = 1 + (i % 16);
    const baseSalary = 65000 + (experienceYears * 7500) + ((i % 11) * 3200);
    const rating = Math.min(5.0, Math.max(3.0, Number((3.5 + ((i % 15) / 10)).toFixed(1))));
    const remote = i % 3 === 0 ? 'Fully Remote' : i % 2 === 0 ? 'Hybrid' : 'On-Site';
    const hireDate = new Date(baseHireDate + ((i * 22) % 1800) * 86400000).toISOString().slice(0, 10);

    rows.push({
      'Employee ID': `EMP-${200 + i}`,
      'Full Name': name,
      'Department': dept,
      'Job Title': role,
      'Experience (Years)': experienceYears,
      'Annual Salary ($)': baseSalary,
      'Performance Rating': rating,
      'Work Arrangement': remote,
      'Hire Date': hireDate,
    });
  }

  return rows;
}

function getSaasData(): Record<string, any>[] {
  const plans = ['Starter', 'Professional', 'Enterprise', 'Scale Elite'];
  const countries = ['United States', 'Germany', 'United Kingdom', 'Canada', 'Australia', 'Japan', 'France', 'Singapore'];
  const billingCycles = ['Monthly', 'Annual'];
  const churnRisks = ['Low', 'Low', 'Low', 'Medium', 'Medium', 'High'];

  const rows: Record<string, any>[] = [];
  const signupStart = new Date(2023, 5, 1).getTime();

  for (let i = 1; i <= 110; i++) {
    const plan = plans[i % plans.length];
    const country = countries[i % countries.length];
    const cycle = billingCycles[i % 2];
    const baseMrr = plan === 'Starter' ? 79 : plan === 'Professional' ? 299 : plan === 'Enterprise' ? 950 : 2400;
    const seats = plan === 'Starter' ? (1 + (i % 5)) : plan === 'Professional' ? (5 + (i % 15)) : (20 + (i % 60));
    const mrr = baseMrr + (seats * 15) + ((i % 10) * 20);
    const nps = 6 + (i % 5); // 6 to 10
    const churn = churnRisks[(i + (nps < 8 ? 2 : 0)) % churnRisks.length];
    const date = new Date(signupStart + ((i * 12) % 700) * 86400000).toISOString().slice(0, 10);

    rows.push({
      'Account ID': `ACC-${5000 + i}`,
      'Subscription Tier': plan,
      'Monthly Recurring Revenue ($)': mrr,
      'Active User Seats': seats,
      'Net Promoter Score': nps,
      'Billing Frequency': cycle,
      'HQ Country': country,
      'Churn Risk': churn,
      'Signup Date': date,
    });
  }

  return rows;
}
