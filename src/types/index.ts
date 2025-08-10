export interface Homework {
  id: string;
  subject: string;
  assignment: string;
  dueDate: string;
  assignedDate: string;
  status: 'Not Started' | 'In Progress' | 'Needs Revision' | 'Completed' | 'Submitted';
  priority: 'High' | 'Medium' | 'Low';
  notes: string;
  submissionLink?: string;
}

export interface CalendarEvent {
  id: string;
  date: string;
  time: string;
  eventType: 'Exam' | 'Quiz' | 'Homework Due' | 'Project' | 'Assignment';
  subject: string;
  description: string;
  location: string;
  reminderSet: boolean;
  preparationChecklist: string[];
}

export interface Grade {
  id: string;
  subject: string;
  assessmentName: string;
  type: 'Exam' | 'Assignment' | 'Quiz' | 'Project';
  maxMarks: number;
  marksObtained: number;
  grade: string;
  dateGraded: string;
  feedback: string;
  weight: number;
}

export interface TimetableSlot {
  day: string;
  time: string;
  subject: string;
  notes?: string;
}

export interface Subject {
  name: string;
  color: string;
}

export const SUBJECTS: Subject[] = [
  { name: 'Math', color: '#3B82F6' },
  { name: 'English', color: '#10B981' },
  { name: 'Science', color: '#8B5CF6' },
  { name: 'History', color: '#F59E0B' },
  { name: 'Geography', color: '#EF4444' },
  { name: 'Computer', color: '#06B6D4' },
  { name: 'Art', color: '#EC4899' },
  { name: 'PE', color: '#84CC16' },
];

export const TIME_SLOTS = [
  '8:00-9:00', '9:00-10:00', '10:00-11:00', '11:00-12:00',
  '12:00-1:00', '1:00-2:00', '2:00-3:00'
];

export const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];