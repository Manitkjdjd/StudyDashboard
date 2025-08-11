import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';
import { Homework, CalendarEvent, Grade, TimetableSlot } from '../types';

interface StudyContextType {
  homework: Homework[];
  calendarEvents: CalendarEvent[];
  grades: Grade[];
  timetable: TimetableSlot[];
  addHomework: (homework: Omit<Homework, 'id'>) => Promise<void>;
  updateHomework: (id: string, homework: Partial<Homework>) => Promise<void>;
  deleteHomework: (id: string) => Promise<void>;
  addCalendarEvent: (event: Omit<CalendarEvent, 'id'>) => Promise<void>;
  updateCalendarEvent: (id: string, event: Partial<CalendarEvent>) => Promise<void>;
  deleteCalendarEvent: (id: string) => Promise<void>;
  addGrade: (grade: Omit<Grade, 'id'>) => Promise<void>;
  updateGrade: (id: string, grade: Partial<Grade>) => Promise<void>;
  deleteGrade: (id: string) => Promise<void>;
  updateTimetable: (timetable: Omit<TimetableSlot, 'id'>[]) => Promise<void>;
}

const StudyContext = createContext<StudyContextType | undefined>(undefined);

export const StudyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [homework, setHomework] = useState<Homework[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [timetable, setTimetable] = useState<TimetableSlot[]>([]);

  // Load data when user changes
  useEffect(() => {
    if (user) {
      loadAllData();
    } else {
      // Clear data when user logs out
      setHomework([]);
      setCalendarEvents([]);
      setGrades([]);
      setTimetable([]);
    }
  }, [user]);

  const loadAllData = async () => {
    if (!user) return;

    try {
      await Promise.all([
        loadHomework(),
        loadCalendarEvents(),
        loadGrades(),
        loadTimetable(),
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const loadHomework = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('homework')
      .select('*')
      .eq('user_id', user.id)
      .order('due_date', { ascending: true });

    if (error) {
      console.error('Error loading homework:', error);
      return;
    }

    const formattedHomework: Homework[] = data.map(item => ({
      id: item.id,
      subject: item.subject,
      assignment: item.assignment,
      dueDate: item.due_date,
      assignedDate: item.assigned_date,
      status: item.status,
      priority: item.priority,
      notes: item.notes || '',
      submissionLink: item.submission_link || undefined,
    }));

    setHomework(formattedHomework);
  };

  const loadCalendarEvents = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('calendar_events')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: true });

    if (error) {
      console.error('Error loading calendar events:', error);
      return;
    }

    const formattedEvents: CalendarEvent[] = data.map(item => ({
      id: item.id,
      date: item.date,
      time: item.time,
      eventType: item.event_type,
      subject: item.subject,
      description: item.description,
      location: item.location || '',
      reminderSet: item.reminder_set || false,
      preparationChecklist: item.preparation_checklist || [],
    }));

    setCalendarEvents(formattedEvents);
  };

  const loadGrades = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('grades')
      .select('*')
      .eq('user_id', user.id)
      .order('date_graded', { ascending: false });

    if (error) {
      console.error('Error loading grades:', error);
      return;
    }

    const formattedGrades: Grade[] = data.map(item => ({
      id: item.id,
      subject: item.subject,
      assessmentName: item.assessment_name,
      type: item.type,
      maxMarks: item.max_marks,
      marksObtained: item.marks_obtained,
      grade: item.grade,
      dateGraded: item.date_graded,
      feedback: item.feedback || '',
      weight: item.weight,
    }));

    setGrades(formattedGrades);
  };

  const loadTimetable = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('timetable')
      .select('*')
      .eq('user_id', user.id);

    if (error) {
      console.error('Error loading timetable:', error);
      return;
    }

    const formattedTimetable: TimetableSlot[] = data.map(item => ({
      day: item.day,
      time: item.time,
      subject: item.subject,
      notes: item.notes || undefined,
    }));

    setTimetable(formattedTimetable);
  };

  // Homework functions
  const addHomework = async (homeworkData: Omit<Homework, 'id'>) => {
    if (!user) return;

    const { data, error } = await supabase
      .from('homework')
      .insert({
        user_id: user.id,
        subject: homeworkData.subject,
        assignment: homeworkData.assignment,
        due_date: homeworkData.dueDate,
        assigned_date: homeworkData.assignedDate,
        status: homeworkData.status,
        priority: homeworkData.priority,
        notes: homeworkData.notes,
        submission_link: homeworkData.submissionLink || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding homework:', error);
      return;
    }

    const newHomework: Homework = {
      id: data.id,
      subject: data.subject,
      assignment: data.assignment,
      dueDate: data.due_date,
      assignedDate: data.assigned_date,
      status: data.status,
      priority: data.priority,
      notes: data.notes || '',
      submissionLink: data.submission_link || undefined,
    };

    setHomework(prev => [...prev, newHomework]);
  };

  const updateHomework = async (id: string, updates: Partial<Homework>) => {
    if (!user) return;

    const updateData: any = {};
    if (updates.subject !== undefined) updateData.subject = updates.subject;
    if (updates.assignment !== undefined) updateData.assignment = updates.assignment;
    if (updates.dueDate !== undefined) updateData.due_date = updates.dueDate;
    if (updates.assignedDate !== undefined) updateData.assigned_date = updates.assignedDate;
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.priority !== undefined) updateData.priority = updates.priority;
    if (updates.notes !== undefined) updateData.notes = updates.notes;
    if (updates.submissionLink !== undefined) updateData.submission_link = updates.submissionLink || null;

    const { error } = await supabase
      .from('homework')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error updating homework:', error);
      return;
    }

    setHomework(prev => prev.map(hw => 
      hw.id === id ? { ...hw, ...updates } : hw
    ));
  };

  const deleteHomework = async (id: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('homework')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting homework:', error);
      return;
    }

    setHomework(prev => prev.filter(hw => hw.id !== id));
  };

  // Calendar event functions
  const addCalendarEvent = async (eventData: Omit<CalendarEvent, 'id'>) => {
    if (!user) return;

    const { data, error } = await supabase
      .from('calendar_events')
      .insert({
        user_id: user.id,
        date: eventData.date,
        time: eventData.time,
        event_type: eventData.eventType,
        subject: eventData.subject,
        description: eventData.description,
        location: eventData.location || '',
        reminder_set: eventData.reminderSet || false,
        preparation_checklist: eventData.preparationChecklist || [],
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding calendar event:', error);
      return;
    }

    const newEvent: CalendarEvent = {
      id: data.id,
      date: data.date,
      time: data.time,
      eventType: data.event_type,
      subject: data.subject,
      description: data.description,
      location: data.location || '',
      reminderSet: data.reminder_set || false,
      preparationChecklist: data.preparation_checklist || [],
    };

    setCalendarEvents(prev => [...prev, newEvent]);
  };

  const updateCalendarEvent = async (id: string, updates: Partial<CalendarEvent>) => {
    if (!user) return;

    const updateData: any = {};
    if (updates.date !== undefined) updateData.date = updates.date;
    if (updates.time !== undefined) updateData.time = updates.time;
    if (updates.eventType !== undefined) updateData.event_type = updates.eventType;
    if (updates.subject !== undefined) updateData.subject = updates.subject;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.location !== undefined) updateData.location = updates.location;
    if (updates.reminderSet !== undefined) updateData.reminder_set = updates.reminderSet;
    if (updates.preparationChecklist !== undefined) updateData.preparation_checklist = updates.preparationChecklist;

    const { error } = await supabase
      .from('calendar_events')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error updating calendar event:', error);
      return;
    }

    setCalendarEvents(prev => prev.map(event => 
      event.id === id ? { ...event, ...updates } : event
    ));
  };

  const deleteCalendarEvent = async (id: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('calendar_events')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting calendar event:', error);
      return;
    }

    setCalendarEvents(prev => prev.filter(event => event.id !== id));
  };

  // Grade functions
  const addGrade = async (gradeData: Omit<Grade, 'id'>) => {
    if (!user) return;

    const { data, error } = await supabase
      .from('grades')
      .insert({
        user_id: user.id,
        subject: gradeData.subject,
        assessment_name: gradeData.assessmentName,
        type: gradeData.type,
        max_marks: gradeData.maxMarks,
        marks_obtained: gradeData.marksObtained,
        grade: gradeData.grade,
        date_graded: gradeData.dateGraded,
        feedback: gradeData.feedback || '',
        weight: gradeData.weight,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding grade:', error);
      return;
    }

    const newGrade: Grade = {
      id: data.id,
      subject: data.subject,
      assessmentName: data.assessment_name,
      type: data.type,
      maxMarks: data.max_marks,
      marksObtained: data.marks_obtained,
      grade: data.grade,
      dateGraded: data.date_graded,
      feedback: data.feedback || '',
      weight: data.weight,
    };

    setGrades(prev => [...prev, newGrade]);
  };

  const updateGrade = async (id: string, updates: Partial<Grade>) => {
    if (!user) return;

    const updateData: any = {};
    if (updates.subject !== undefined) updateData.subject = updates.subject;
    if (updates.assessmentName !== undefined) updateData.assessment_name = updates.assessmentName;
    if (updates.type !== undefined) updateData.type = updates.type;
    if (updates.maxMarks !== undefined) updateData.max_marks = updates.maxMarks;
    if (updates.marksObtained !== undefined) updateData.marks_obtained = updates.marksObtained;
    if (updates.grade !== undefined) updateData.grade = updates.grade;
    if (updates.dateGraded !== undefined) updateData.date_graded = updates.dateGraded;
    if (updates.feedback !== undefined) updateData.feedback = updates.feedback;
    if (updates.weight !== undefined) updateData.weight = updates.weight;

    const { error } = await supabase
      .from('grades')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error updating grade:', error);
      return;
    }

    setGrades(prev => prev.map(grade => 
      grade.id === id ? { ...grade, ...updates } : grade
    ));
  };

  const deleteGrade = async (id: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('grades')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting grade:', error);
      return;
    }

    setGrades(prev => prev.filter(grade => grade.id !== id));
  };

  // Timetable functions
  const updateTimetable = async (newTimetable: Omit<TimetableSlot, 'id'>[]) => {
    if (!user) return;

    try {
      // First, delete all existing timetable entries for the user
      const { error: deleteError } = await supabase
        .from('timetable')
        .delete()
        .eq('user_id', user.id);

      if (deleteError) {
        console.error('Error deleting existing timetable:', deleteError);
        return;
      }

      // Then insert the new timetable entries
      if (newTimetable.length > 0) {
        const insertData = newTimetable.map(slot => ({
          user_id: user.id,
          day: slot.day,
          time: slot.time,
          subject: slot.subject,
          notes: slot.notes || null,
        }));

        const { error: insertError } = await supabase
          .from('timetable')
          .insert(insertData);

        if (insertError) {
          console.error('Error inserting new timetable:', insertError);
          return;
        }
      }

      // Update local state
      setTimetable(newTimetable);
    } catch (error) {
      console.error('Error updating timetable:', error);
    }
  };

  const value: StudyContextType = {
    homework,
    calendarEvents,
    grades,
    timetable,
    addHomework,
    updateHomework,
    deleteHomework,
    addCalendarEvent,
    updateCalendarEvent,
    deleteCalendarEvent,
    addGrade,
    updateGrade,
    deleteGrade,
    updateTimetable,
  };

  return <StudyContext.Provider value={value}>{children}</StudyContext.Provider>;
};

export const useStudy = () => {
  const context = useContext(StudyContext);
  if (context === undefined) {
    throw new Error('useStudy must be used within a StudyProvider');
  }
  return context;
};