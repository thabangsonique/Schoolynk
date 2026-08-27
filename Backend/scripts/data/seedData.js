export const seedData = {
  school: {
    school_name: "SchooLynk Academy",
    geo_latitude: -25.7479,
    geo_longitude: 28.2293,
    geo_radius_meters: 150,
    clock_in_start: "06:00:00",
    clock_in_deadline: "08:00:00",
  },

  accounts: [
    { key: "admin", email: "admin@schoolynk.test", firstName: "Olivia", lastName: "Mokoena", role: "admin", employeeNumber: null },
    { key: "sarah", email: "sarah.johnson@schoolynk.test", firstName: "Sarah", lastName: "Johnson", role: "teacher", employeeNumber: "EMP-1001" },
    { key: "david", email: "david.chen@schoolynk.test", firstName: "David", lastName: "Chen", role: "teacher", employeeNumber: "EMP-1002" },
    { key: "priya", email: "priya.naidoo@schoolynk.test", firstName: "Priya", lastName: "Naidoo", role: "teacher", employeeNumber: "EMP-1003" },
    { key: "thabo", email: "thabo.dlamini@schoolynk.test", firstName: "Thabo", lastName: "Dlamini", role: "teacher", employeeNumber: "EMP-1004" },
  ],

  classes: [
    { key: "4A", name: "4A", grade: "4", teacherKey: "sarah", roomNumber: "A-101", studentCapacity: 30 },
    { key: "4B", name: "4B", grade: "4", teacherKey: "david", roomNumber: "A-102", studentCapacity: 30 },
    { key: "5A", name: "5A", grade: "5", teacherKey: "priya", roomNumber: "B-201", studentCapacity: 32 },
    { key: "5B", name: "5B", grade: "5", teacherKey: "thabo", roomNumber: "B-202", studentCapacity: 32 },
  ],

  subjects: [
    { name: "Mathematics", code: "MATH", description: "Numeracy, problem solving, and mathematical reasoning.", leadTeacherKey: "sarah" },
    { name: "English Home Language", code: "ENG-HL", description: "Reading, writing, speaking, and language skills.", leadTeacherKey: "david" },
    { name: "Natural Sciences", code: "NS", description: "Scientific investigation and environmental knowledge.", leadTeacherKey: "priya" },
    { name: "Social Sciences", code: "SS", description: "History, geography, and social understanding.", leadTeacherKey: "thabo" },
  ],

  parents: [
    { key: "mthembu", firstName: "Nomsa", lastName: "Mthembu", email: "nomsa.mthembu@example.test", phoneNumber: "+27115550101", address: "12 Oak Street, Pretoria", relationship: "Mother" },
    { key: "mokoena", firstName: "Kagiso", lastName: "Mokoena", email: "kagiso.mokoena@example.test", phoneNumber: "+27115550102", address: "18 Pine Avenue, Pretoria", relationship: "Father" },
    { key: "naidoo", firstName: "Anita", lastName: "Naidoo", email: "anita.naidoo@example.test", phoneNumber: "+27115550103", address: "4 Jasmine Road, Pretoria", relationship: "Mother" },
    { key: "dlamini", firstName: "Sibusiso", lastName: "Dlamini", email: "sibusiso.dlamini@example.test", phoneNumber: "+27115550104", address: "31 Acacia Drive, Pretoria", relationship: "Father" },
    { key: "khumalo", firstName: "Zanele", lastName: "Khumalo", email: "zanele.khumalo@example.test", phoneNumber: "+27115550105", address: "8 Maple Close, Pretoria", relationship: "Mother" },
    { key: "botha", firstName: "Megan", lastName: "Botha", email: "megan.botha@example.test", phoneNumber: "+27115550106", address: "6 Church Street, Pretoria", relationship: "Mother" },
  ],

  learners: [
    { studentNumber: "STU-SEED-0001", firstName: "Amahle", lastName: "Mthembu", dateOfBirth: "2016-03-14", address: "12 Oak Street, Pretoria", classKey: "4A", guardianKey: "mthembu" },
    { studentNumber: "STU-SEED-0002", firstName: "Liam", lastName: "Mokoena", dateOfBirth: "2016-06-22", address: "18 Pine Avenue, Pretoria", classKey: "4A", guardianKey: "mokoena" },
    { studentNumber: "STU-SEED-0003", firstName: "Naledi", lastName: "Naidoo", dateOfBirth: "2016-01-30", address: "4 Jasmine Road, Pretoria", classKey: "4A", guardianKey: "naidoo" },
    { studentNumber: "STU-SEED-0004", firstName: "Sipho", lastName: "Dlamini", dateOfBirth: "2016-09-11", address: "31 Acacia Drive, Pretoria", classKey: "4B", guardianKey: "dlamini" },
    { studentNumber: "STU-SEED-0005", firstName: "Ayanda", lastName: "Khumalo", dateOfBirth: "2016-11-05", address: "8 Maple Close, Pretoria", classKey: "4B", guardianKey: "khumalo" },
    { studentNumber: "STU-SEED-0006", firstName: "Ethan", lastName: "Botha", dateOfBirth: "2016-04-18", address: "6 Church Street, Pretoria", classKey: "4B", guardianKey: "botha" },
    { studentNumber: "STU-SEED-0007", firstName: "Zinhle", lastName: "Mthembu", dateOfBirth: "2015-02-09", address: "12 Oak Street, Pretoria", classKey: "5A", guardianKey: "mthembu" },
    { studentNumber: "STU-SEED-0008", firstName: "Noah", lastName: "Mokoena", dateOfBirth: "2015-07-17", address: "18 Pine Avenue, Pretoria", classKey: "5A", guardianKey: "mokoena" },
    { studentNumber: "STU-SEED-0009", firstName: "Lerato", lastName: "Naidoo", dateOfBirth: "2015-10-25", address: "4 Jasmine Road, Pretoria", classKey: "5A", guardianKey: "naidoo" },
    { studentNumber: "STU-SEED-0010", firstName: "Mandla", lastName: "Dlamini", dateOfBirth: "2015-05-16", address: "31 Acacia Drive, Pretoria", classKey: "5B", guardianKey: "dlamini" },
    { studentNumber: "STU-SEED-0011", firstName: "Ava", lastName: "Khumalo", dateOfBirth: "2015-08-02", address: "8 Maple Close, Pretoria", classKey: "5B", guardianKey: "khumalo" },
    { studentNumber: "STU-SEED-0012", firstName: "Mia", lastName: "Botha", dateOfBirth: "2015-12-19", address: "6 Church Street, Pretoria", classKey: "5B", guardianKey: "botha" },
  ],
};
