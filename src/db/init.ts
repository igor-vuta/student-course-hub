import { db } from "./database.ts";
import * as bcrypt from "bcrypt";

const schemaStatements = [
  `
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('admin', 'editor'))
    )
  `,
  `
    CREATE TABLE IF NOT EXISTS staff (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      role_title TEXT NOT NULL
    )
  `,
  `
    CREATE TABLE IF NOT EXISTS programmes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      level TEXT NOT NULL CHECK(level IN ('Undergraduate', 'Postgraduate')),
      description TEXT NOT NULL,
      published INTEGER NOT NULL DEFAULT 1,
      image_url TEXT NOT NULL DEFAULT ''
    )
  `,
  `
    CREATE TABLE IF NOT EXISTS modules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      year INTEGER NOT NULL CHECK(year BETWEEN 1 AND 4),
      description TEXT NOT NULL,
      leader_staff_id INTEGER,
      FOREIGN KEY(leader_staff_id) REFERENCES staff(id)
    )
  `,
  `
    CREATE TABLE IF NOT EXISTS programme_modules (
      programme_id INTEGER NOT NULL,
      module_id INTEGER NOT NULL,
      PRIMARY KEY(programme_id, module_id),
      FOREIGN KEY(programme_id) REFERENCES programmes(id),
      FOREIGN KEY(module_id) REFERENCES modules(id)
    )
  `,
  `
    CREATE TABLE IF NOT EXISTS programme_staff (
      programme_id INTEGER NOT NULL,
      staff_id INTEGER NOT NULL,
      responsibility TEXT NOT NULL,
      PRIMARY KEY(programme_id, staff_id, responsibility),
      FOREIGN KEY(programme_id) REFERENCES programmes(id),
      FOREIGN KEY(staff_id) REFERENCES staff(id)
    )
  `,
  `
    CREATE TABLE IF NOT EXISTS interests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      programme_id INTEGER NOT NULL,
      student_name TEXT NOT NULL,
      email TEXT NOT NULL,
      created_at TEXT NOT NULL,
      UNIQUE(programme_id, email),
      FOREIGN KEY(programme_id) REFERENCES programmes(id)
    )
  `,
];

const staffSeedData: [string, string][] = [
  ["Dr. Amina Patel",   "Programme Leader"],
  ["Prof. Tom Blake",   "Module Leader"],
  ["Dr. Sarah Ncube",   "Module Leader"],
  ["Dr. Kwame Asante",  "Module Leader"],
  ["Prof. Li Wei",      "Senior Lecturer"],
  ["Dr. Priya Sharma",  "Module Leader"],
];

const programmeSeedData: [string, string, string, number, string][] = [
  [
    "BSc Cyber Security",
    "Undergraduate",
    "Hands-on security, networks, incident response, and secure development. Graduates are equipped for roles in penetration testing, SOC analysis, and secure software engineering.",
    1,
    "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=70",
  ],
  [
    "BSc Software Engineering",
    "Undergraduate",
    "A rigorous foundation in software design, algorithms, and professional engineering practice. Covers full-stack development, agile methods, and team-based project work.",
    1,
    "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=70",
  ],
  [
    "MSc Data Science",
    "Postgraduate",
    "Advanced analytics, machine learning, and data engineering for modern industry. Suitable for graduates seeking expertise in AI-driven decision making and large-scale data systems.",
    1,
    "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?auto=format&fit=crop&w=1200&q=70",
  ],
  [
    "MSc Artificial Intelligence",
    "Postgraduate",
    "Deep learning, NLP, computer vision, and AI ethics. Prepares graduates to design and deploy intelligent systems across healthcare, finance, and beyond.",
    1,
    "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?auto=format&fit=crop&w=1200&q=70",
  ],
  [
    "BSc Computer Science",
    "Undergraduate",
    "A broad grounding in computing: programming, operating systems, databases, and theory of computation. Ideal for students who want flexibility to specialise in their final year.",
    1,
    "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=70",
  ],
  [
    "BSc Networks & Cloud Computing",
    "Undergraduate",
    "Design and manage modern network infrastructure, cloud platforms, and distributed systems. Covers AWS/Azure fundamentals, virtualisation, and network security.",
    1,
    "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=70",
  ],
  [
    "MSc Cloud & DevOps Engineering",
    "Postgraduate",
    "A practice-led programme covering cloud-native architectures, Kubernetes, infrastructure-as-code, and site-reliability engineering. Designed for engineers moving into platform or DevOps roles.",
    1,
    "https://images.unsplash.com/photo-1607799279861-4dd421887fb3?auto=format&fit=crop&w=1200&q=70",
  ],
  [
    "MSc Cyber Security Management",
    "Postgraduate",
    "Strategic and technical leadership in cyber security. Covers risk management, governance frameworks (ISO 27001, NIST), incident management, and security operations at scale.",
    1,
    "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&q=70",
  ],
];

const moduleSeedData: [string, number, string, number][] = [
  ["Computer Networks",           1, "Fundamentals of network architecture, the OSI model, TCP/IP, and routing protocols.",                   2], 
  ["Professional Practice",       1, "Ethics, legal frameworks, project management, and communication skills for computing professionals.",   1], 

  ["Secure Programming",          2, "Practical secure coding in C and Python: buffer overflows, input validation, and OWASP Top 10 mitigations.", 2],
  ["Digital Forensics",           2, "Evidence acquisition, chain of custody, file system analysis, and forensic tool usage.",                     3],
  ["Penetration Testing",         3, "Methodology and tooling for authorised ethical hacking: reconnaissance, exploitation, and reporting.",        4], 
  ["Incident Response",           3, "Threat detection, containment playbooks, SIEM platforms, and post-incident review.",                         3], 
  ["Cryptography & PKI",          2, "Symmetric and asymmetric encryption, digital signatures, certificate authorities, and TLS.",                  5],

  ["Algorithms & Data Structures", 1, "Algorithm complexity, sorting, searching, trees, graphs, and dynamic programming.",                         5],
  ["Software Architecture",        2, "Design patterns, microservices, domain-driven design, and architectural trade-offs.",                        6],
  ["Agile & DevOps",               2, "Scrum, Kanban, CI/CD pipelines, containerisation, and test-driven development.",                            4], 
  ["Web Application Development",  3, "Full-stack development: REST APIs, authentication, front-end frameworks, and deployment.",                   2], 

  ["Applied Machine Learning",     1, "Supervised and unsupervised learning, model evaluation, feature engineering, and scikit-learn.",             6],
  ["Data Engineering",             1, "ETL pipelines, data lakes, Apache Spark, and cloud storage systems.",                                        3],
  ["Statistical Modelling",        1, "Bayesian inference, regression analysis, hypothesis testing, and R.",                                        5],

  ["Deep Learning",                1, "Neural network architectures, backpropagation, CNNs, RNNs, and PyTorch.",                                    6],
  ["Natural Language Processing",  1, "Tokenisation, embeddings, transformers, and fine-tuning large language models.",                             5],
  ["AI Ethics & Governance",       1, "Bias, fairness, explainability, GDPR implications, and responsible AI deployment.",                         1],

  ["Operating Systems",            1, "Processes, scheduling, memory management, file systems, and concurrency.",                                   4],
  ["Databases",                    2, "Relational theory, SQL, normalisation, transactions, and an introduction to NoSQL.",                         6],
  ["Compiler Design",              3, "Lexical analysis, parsing, semantic analysis, and code generation.",                                        5],

  ["Cloud Platforms",              2, "AWS and Azure core services, IAM, compute, storage, and cost management.",                                  4],
  ["Virtualisation & Containers",  2, "Hypervisors, Docker, Kubernetes, and container orchestration fundamentals.",                                2],
  ["Network Security",             3, "Firewalls, IDS/IPS, VPNs, zero-trust architecture, and cloud-native security controls.",                   3],

  ["Infrastructure as Code",       1, "Terraform, Ansible, and GitOps workflows for reproducible cloud environments.",                             4],
  ["Site Reliability Engineering", 1, "SLOs, error budgets, observability, alerting, and chaos engineering.",                                     2],

  ["Security Risk & Governance",   1, "ISO 27001, NIST CSF, risk registers, audit, and regulatory compliance.",                                   1],
  ["Security Operations",          1, "SOC design, threat intelligence, SIEM/SOAR platforms, and red vs. blue team exercises.",                   3],
];

const programmeModuleSeedData: [number, number][] = [
  [1,  1], [1,  2],              
  [1,  3], [1,  4], [1,  7],     
  [1,  5], [1,  6],              

  [2,  1], [2,  2],              
  [2,  8],                       
  [2,  9], [2, 10], [2, 11],     

  [3, 12], [3, 13], [3, 14],

  [4, 12], [4, 15], [4, 16], [4, 17],

  [5,  1], [5,  2],
  [5,  8], [5, 18],
  [5, 19], [5,  9],
  [5, 20],

  [6,  1], [6,  2],
  [6, 21], [6, 22],
  [6, 23],

  [7, 10], [7, 22], [7, 24], [7, 25],

  [8,  6], [8,  7], [8, 26], [8, 27],
];

const programmeStaffSeedData: [number, number, string][] = [
  [1, 1, "Programme Leader"],
  [1, 2, "Module Leader"],
  [1, 3, "Module Leader"],
  [1, 4, "Module Leader"],
  [2, 1, "Programme Leader"],
  [2, 5, "Module Leader"],
  [2, 6, "Module Leader"],
  [3, 1, "Programme Leader"],
  [3, 3, "Module Leader"],
  [3, 5, "Senior Lecturer"],
  [4, 1, "Programme Leader"],
  [4, 6, "Module Leader"],
  [4, 5, "Senior Lecturer"],
  [5, 1, "Programme Leader"],
  [5, 4, "Module Leader"],
  [5, 5, "Senior Lecturer"],
  [5, 6, "Module Leader"],
  [6, 1, "Programme Leader"],
  [6, 2, "Module Leader"],
  [6, 3, "Module Leader"],
  [6, 4, "Module Leader"],
  [7, 1, "Programme Leader"],
  [7, 4, "Module Leader"],
  [7, 2, "Senior Lecturer"],
  [8, 1, "Programme Leader"],
  [8, 3, "Module Leader"],
  [8, 5, "Senior Lecturer"],
];

async function hashPassword(input: string): Promise<string> {
  return await bcrypt.hash(input);
}

export async function initializeDatabase(): Promise<void> {
  for (const statement of schemaStatements) {
    db.execute(statement);
  }

  const [{ totalUsers }] = db.queryEntries<{ totalUsers: number }>(
    "SELECT COUNT(*) AS totalUsers FROM users",
  );

  if (totalUsers > 0) {
    return;
  }

  const adminHash = await hashPassword("admin123");
  const editorHash = await hashPassword("editor123");

  db.query(
    "INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?), (?, ?, ?)",
    ["admin", adminHash, "admin", "editor", editorHash, "editor"],
  );

  for (const [name, roleTitle] of staffSeedData) {
    db.query("INSERT INTO staff (name, role_title) VALUES (?, ?)", [name, roleTitle]);
  }

  for (const [title, level, description, published, imageUrl] of programmeSeedData) {
    db.query(
      "INSERT INTO programmes (title, level, description, published, image_url) VALUES (?, ?, ?, ?, ?)",
      [title, level, description, published, imageUrl],
    );
  }

  for (const [name, year, description, leaderStaffId] of moduleSeedData) {
    db.query(
      "INSERT INTO modules (name, year, description, leader_staff_id) VALUES (?, ?, ?, ?)",
      [name, year, description, leaderStaffId],
    );
  }

  for (const [programmeId, moduleId] of programmeModuleSeedData) {
    db.query(
      "INSERT INTO programme_modules (programme_id, module_id) VALUES (?, ?)",
      [programmeId, moduleId],
    );
  }

  for (const [programmeId, staffId, responsibility] of programmeStaffSeedData) {
    db.query(
      "INSERT INTO programme_staff (programme_id, staff_id, responsibility) VALUES (?, ?, ?)",
      [programmeId, staffId, responsibility],
    );
  }
}
