// PolySkill - Application Constants

export const APP_NAME = "PolySkill";
export const APP_TAGLINE = "Learn Skills. Build Projects. Find Your Team.";
export const APP_DESCRIPTION =
  "One platform for polytechnic students to learn, collaborate, showcase projects, and grow together.";

export const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Explore Projects", href: "/explore/projects" },
  { label: "Explore Students", href: "/explore/students" },
  { label: "Roadmaps", href: "/roadmaps" },
] as const;

export const STUDENT_NAV_LINKS = [
  { label: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
  { label: "Profile", href: "/profile", icon: "User" },
  { label: "My Skills", href: "/skills", icon: "Zap" },
  { label: "My Projects", href: "/projects", icon: "FolderKanban" },
  { label: "Team Finder", href: "/teams", icon: "Users" },
  { label: "Invitations", href: "/invitations", icon: "Mail" },
  { label: "Messages", href: "/messages", icon: "MessageSquare" },
  { label: "Roadmaps", href: "/roadmaps", icon: "Map" },
  { label: "Notifications", href: "/notifications", icon: "Bell" },
  { label: "Settings", href: "/settings", icon: "Settings" },
] as const;

export const ADMIN_NAV_LINKS = [
  { label: "Dashboard", href: "/admin", icon: "LayoutDashboard" },
  { label: "Students", href: "/admin/students", icon: "GraduationCap" },
  { label: "Projects", href: "/admin/projects", icon: "FolderKanban" },
  { label: "Reports", href: "/admin/reports", icon: "Flag" },
  { label: "Skills Catalog", href: "/admin/skills", icon: "Zap" },
  { label: "Roadmaps", href: "/admin/roadmaps", icon: "Map" },
  { label: "Announcements", href: "/admin/announcements", icon: "Megaphone" },
] as const;

export const DEPARTMENTS = [
  "Computer Science & Technology",
  "Electrical & Electronic Technology",
  "Civil Technology",
  "Mechanical Technology",
  "Electronics Technology",
  "Power Technology",
  "Telecommunication Technology",
  "Architecture Technology",
  "Food Technology",
  "Other",
] as const;

export const SEMESTERS = [
  "1st Semester",
  "2nd Semester",
  "3rd Semester",
  "4th Semester",
  "5th Semester",
  "6th Semester",
  "7th Semester",
  "8th Semester",
] as const;

export const SKILL_CATEGORIES = [
  "Frontend Development",
  "Backend Development",
  "Programming Languages",
  "Database",
  "UI/UX Design",
  "Cyber Security",
  "Networking",
  "DevOps",
  "Mobile Development",
  "Data Science",
] as const;

export const SKILL_LEVELS = [
  "Beginner",
  "Intermediate",
  "Advanced",
  "Expert",
] as const;

export const EXPERIENCE_LEVELS = [
  "Beginner",
  "Intermediate",
  "Advanced",
] as const;

export const PROJECT_CATEGORIES = [
  "Web Application",
  "Mobile Application",
  "Desktop Application",
  "API / Backend",
  "UI/UX Design",
  "Machine Learning",
  "Cyber Security",
  "IoT / Hardware",
  "Game Development",
  "Other",
] as const;

export const PROJECT_STATUSES = [
  "Planning",
  "In Progress",
  "Completed",
  "On Hold",
] as const;

export const TEAM_STATUSES = [
  "Planning",
  "Recruiting",
  "In Progress",
  "Completed",
] as const;

export const TEAM_ROLES = [
  "Team Leader",
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "UI/UX Designer",
  "Database Administrator",
  "DevOps Engineer",
  "Tester / QA",
] as const;

export const INSTITUTES = [
  "Dhaka Polytechnic Institute",
  "Chittagong Polytechnic Institute",
  "Rajshahi Polytechnic Institute",
  "Khulna Polytechnic Institute",
  "Sylhet Polytechnic Institute",
  "Barisal Polytechnic Institute",
  "Rangpur Polytechnic Institute",
  "Mymensingh Polytechnic Institute",
  "Comilla Polytechnic Institute",
  "Faridpur Polytechnic Institute",
  "Bogra Polytechnic Institute",
  "Dinajpur Polytechnic Institute",
  "Pabna Polytechnic Institute",
  "Other",
] as const;
