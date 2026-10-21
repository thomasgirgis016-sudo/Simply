export interface ScheduledExamPaper {
  id: string;
  subjectCode: string;
  subjectName: string;
  paperCode: string; // e.g. "0580/42"
  paperTitle: string; // e.g. "Paper 4 (Extended Theory)"
  examDate: string; // YYYY-MM-DD
  timeOfDay: 'AM' | 'PM';
  durationMinutes: number;
  series: 'May/June 2026' | 'Oct/Nov 2026';
  board: 'CIE' | 'Edexcel';
}

export const OFFICIAL_EXAM_TIMETABLE: ScheduledExamPaper[] = [
  // Maths 0580
  {
    id: 'exam-0580-p2',
    subjectCode: '0580',
    subjectName: 'Mathematics',
    paperCode: '0580/22',
    paperTitle: 'Paper 2 (Extended Non-Calculator/Core)',
    examDate: '2026-05-05',
    timeOfDay: 'AM',
    durationMinutes: 90,
    series: 'May/June 2026',
    board: 'CIE'
  },
  {
    id: 'exam-0580-p4',
    subjectCode: '0580',
    subjectName: 'Mathematics',
    paperCode: '0580/42',
    paperTitle: 'Paper 4 (Extended Calculator Permitted)',
    examDate: '2026-05-12',
    timeOfDay: 'AM',
    durationMinutes: 150,
    series: 'May/June 2026',
    board: 'CIE'
  },

  // Chemistry 0620
  {
    id: 'exam-0620-p4',
    subjectCode: '0620',
    subjectName: 'Chemistry',
    paperCode: '0620/42',
    paperTitle: 'Paper 4 (Extended Theory)',
    examDate: '2026-05-18',
    timeOfDay: 'PM',
    durationMinutes: 75,
    series: 'May/June 2026',
    board: 'CIE'
  },
  {
    id: 'exam-0620-p6',
    subjectCode: '0620',
    subjectName: 'Chemistry',
    paperCode: '0620/62',
    paperTitle: 'Paper 6 (Alternative to Practical ATP)',
    examDate: '2026-05-27',
    timeOfDay: 'PM',
    durationMinutes: 60,
    series: 'May/June 2026',
    board: 'CIE'
  },
  {
    id: 'exam-0620-p2',
    subjectCode: '0620',
    subjectName: 'Chemistry',
    paperCode: '0620/22',
    paperTitle: 'Paper 2 (Multiple Choice Extended)',
    examDate: '2026-06-08',
    timeOfDay: 'PM',
    durationMinutes: 45,
    series: 'May/June 2026',
    board: 'CIE'
  },

  // Physics 0625
  {
    id: 'exam-0625-p4',
    subjectCode: '0625',
    subjectName: 'Physics',
    paperCode: '0625/42',
    paperTitle: 'Paper 4 (Extended Theory)',
    examDate: '2026-05-15',
    timeOfDay: 'AM',
    durationMinutes: 75,
    series: 'May/June 2026',
    board: 'CIE'
  },
  {
    id: 'exam-0625-p6',
    subjectCode: '0625',
    subjectName: 'Physics',
    paperCode: '0625/62',
    paperTitle: 'Paper 6 (Alternative to Practical ATP)',
    examDate: '2026-05-29',
    timeOfDay: 'AM',
    durationMinutes: 60,
    series: 'May/June 2026',
    board: 'CIE'
  },
  {
    id: 'exam-0625-p2',
    subjectCode: '0625',
    subjectName: 'Physics',
    paperCode: '0625/22',
    paperTitle: 'Paper 2 (Multiple Choice Extended)',
    examDate: '2026-06-11',
    timeOfDay: 'AM',
    durationMinutes: 45,
    series: 'May/June 2026',
    board: 'CIE'
  },

  // Biology 0610
  {
    id: 'exam-0610-p4',
    subjectCode: '0610',
    subjectName: 'Biology',
    paperCode: '0610/42',
    paperTitle: 'Paper 4 (Extended Theory)',
    examDate: '2026-05-14',
    timeOfDay: 'PM',
    durationMinutes: 75,
    series: 'May/June 2026',
    board: 'CIE'
  },
  {
    id: 'exam-0610-p6',
    subjectCode: '0610',
    subjectName: 'Biology',
    paperCode: '0610/62',
    paperTitle: 'Paper 6 (Alternative to Practical ATP)',
    examDate: '2026-05-26',
    timeOfDay: 'PM',
    durationMinutes: 60,
    series: 'May/June 2026',
    board: 'CIE'
  },
  {
    id: 'exam-0610-p2',
    subjectCode: '0610',
    subjectName: 'Biology',
    paperCode: '0610/22',
    paperTitle: 'Paper 2 (Multiple Choice Extended)',
    examDate: '2026-06-09',
    timeOfDay: 'PM',
    durationMinutes: 45,
    series: 'May/June 2026',
    board: 'CIE'
  },

  // English 0510
  {
    id: 'exam-0510-p1',
    subjectCode: '0510',
    subjectName: 'English as a Second Language',
    paperCode: '0510/12',
    paperTitle: 'Paper 1 (Reading & Writing)',
    examDate: '2026-05-07',
    timeOfDay: 'AM',
    durationMinutes: 120,
    series: 'May/June 2026',
    board: 'CIE'
  },
  {
    id: 'exam-0510-p2',
    subjectCode: '0510',
    subjectName: 'English as a Second Language',
    paperCode: '0510/22',
    paperTitle: 'Paper 2 (Listening Comprehension)',
    examDate: '2026-05-09',
    timeOfDay: 'AM',
    durationMinutes: 50,
    series: 'May/June 2026',
    board: 'CIE'
  }
];
