// PolySkill - Shared TypeScript Types

// ============ User / Auth Types ============
export interface User {
  id: string;
  fullName: string;
  username: string;
  email: string;
  rollNumber?: string;
  avatar?: string;
  institute: string;
  department: string;
  semester: string;
  bio?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  linkedinUrl?: string;
  experienceLevel: "Beginner" | "Intermediate" | "Advanced";
  role: "student" | "admin";
  profileCompletion: number;
  joinedAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  fullName: string;
  email: string;
  password: string;
  rollNumber: string;
  institute: string;
  department: string;
  semester: string;
}

// ============ Skill Types ============
export interface Skill {
  id: string;
  name: string;
  category: string;
  level: "Beginner" | "Intermediate" | "Advanced" | "Expert";
  progress: number; // 0-100
  targetDate?: string;
  learningGoal?: string;
  userId: string;
}

// ============ Project Types ============
export interface Project {
  id: string;
  title: string;
  description: string;
  thumbnail?: string;
  techStack: string[];
  githubUrl?: string;
  liveUrl?: string;
  category: string;
  status: "Planning" | "In Progress" | "Completed" | "On Hold";
  likes: number;
  isLiked: boolean;
  isBookmarked: boolean;
  comments: Comment[];
  createdBy: User;
  teamId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  content: string;
  author: User;
  createdAt: string;
}

// ============ Team Types ============
export interface Team {
  id: string;
  name: string;
  description: string;
  project?: Project;
  status: "Planning" | "Recruiting" | "In Progress" | "Completed";
  members: TeamMember[];
  maxMembers: number;
  requiredSkills: string[];
  createdBy: User;
  createdAt: string;
}

export interface TeamMember {
  user: User;
  role: string;
  joinedAt: string;
}

// ============ Invitation Types ============
export interface Invitation {
  id: string;
  team: Team;
  from: User;
  to: User;
  message?: string;
  status: "pending" | "accepted" | "declined";
  createdAt: string;
}

// ============ Message Types ============
export interface Conversation {
  id: string;
  participants: User[];
  lastMessage?: Message;
  unreadCount: number;
  updatedAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  sender: User;
  content: string;
  isRead: boolean;
  createdAt: string;
}

// ============ Notification Types ============
export interface Notification {
  id: string;
  type: "invitation" | "message" | "team" | "project" | "system";
  title: string;
  description: string;
  isRead: boolean;
  link?: string;
  createdAt: string;
}

// ============ Roadmap Types ============
export interface Roadmap {
  id: string;
  slug: string;
  title: string;
  description: string;
  icon: string;
  totalSteps: number;
  completedSteps: number;
  steps: RoadmapStep[];
  estimatedDuration: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
}

export interface RoadmapStep {
  id: string;
  title: string;
  description: string;
  topics: string[];
  resources: RoadmapResource[];
  isCompleted: boolean;
  order: number;
}

export interface RoadmapResource {
  title: string;
  url: string;
  type: "article" | "video" | "course" | "documentation";
}

// ============ GitHub Types ============
export interface GitHubRepo {
  name: string;
  description: string;
  language: string;
  stars: number;
  url: string;
  updatedAt: string;
}

export interface GitHubProfile {
  username: string;
  avatarUrl: string;
  repos: GitHubRepo[];
}

// ============ Admin Types ============
export interface AdminStats {
  totalStudents: number;
  totalProjects: number;
  activeTeams: number;
  reportedContent: number;
  newStudentsThisMonth: number;
  newProjectsThisMonth: number;
}

export interface Report {
  id: string;
  type: "project" | "user" | "comment";
  reason: string;
  reportedBy: User;
  targetId: string;
  targetTitle: string;
  status: "pending" | "resolved" | "dismissed";
  createdAt: string;
}

// ============ Dashboard Types ============
export interface DashboardStats {
  totalSkills: number;
  totalProjects: number;
  activeTeams: number;
  pendingInvitations: number;
}

export interface Activity {
  id: string;
  type: "project" | "skill" | "team" | "invitation";
  description: string;
  timestamp: string;
}
