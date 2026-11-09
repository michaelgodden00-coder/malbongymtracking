// Muscle groups
export const MU = [
  'chest','upper back','lats','traps','front delts','side delts','rear delts',
  'biceps','triceps','forearms','quadriceps','hamstrings','glutes','calves',
  'abdominals','lower back','adductors',
];
export const UP   = ['chest','upper back','lats','traps','front delts','side delts','rear delts','biceps','triceps','forearms','abdominals'];
export const PUSH = ['chest','front delts','side delts','triceps'];
export const PULL = ['upper back','lats','traps','rear delts','biceps','forearms'];

// Pages (key, label) — Social added
export const PAGES = [
  ['clubhouse', 'Clubhouse'],
  ['training',  'Training'],
  ['library',   'The Library'],
  ['muscles',   'Muscle Breakdown'],
  ['progress',  'Progress'],
  ['overload',  'Overload'],
  ['records',   'Record Book'],
  ['social',    'Social'],
  ['settings',  'Settings'],
];

// SVG body-map shape data
export const SH = {
  front: [
    ['chest',       'M70 48h60v26H70z'],
    ['front delts', 'M52 44a9 9 0 1 0 .1 0zM148 44a9 9 0 1 0 .1 0z'],
    ['side delts',  'M40 54a8 10 0 1 0 .1 0zM160 54a8 10 0 1 0 .1 0z'],
    ['biceps',      'M40 72h14v28H40zM146 72h14v28h-14z'],
    ['forearms',    'M36 102h14v32H36zM150 102h14v32h-14z'],
    ['abdominals',  'M84 78h32v44H84z'],
    ['quadriceps',  'M70 128h27v56H70zM103 128h27v56h-27z'],
    ['adductors',   'M96 128h8v40h-8z'],
    ['calves',      'M72 188h22v28H72zM106 188h22v28h-22z'],
  ],
  back: [
    ['traps',       'M82 36h36v18H82z'],
    ['upper back',  'M70 56h60v20H70z'],
    ['lats',        'M62 78h18v38H62zM120 78h18v38h-18z'],
    ['rear delts',  'M48 46a8 8 0 1 0 .1 0zM152 46a8 8 0 1 0 .1 0z'],
    ['triceps',     'M40 72h14v28H40zM146 72h14v28h-14z'],
    ['forearms',    'M36 102h14v32H36zM150 102h14v32h-14z'],
    ['lower back',  'M84 90h32v26H84z'],
    ['glutes',      'M70 120h60v26H70z'],
    ['hamstrings',  'M70 150h27v38H70zM103 150h27v38h-27z'],
    ['calves',      'M72 190h22v28H72zM106 190h22v28h-22z'],
  ],
};

// Default exercises seeded on first launch
export const DEFAULT_EXERCISES = [
  { name:'Barbell Back Squat', p:'quadriceps', s:['glutes','adductors','lower back'], cat:'compound', eq:'Barbell', pat:'Squat',          uni:false },
  { name:'Bench Press',        p:'chest',       s:['triceps','front delts'],           cat:'compound', eq:'Barbell', pat:'Horizontal push', uni:false },
  { name:'Deadlift',           p:'hamstrings',  s:['glutes','lower back','traps'],     cat:'compound', eq:'Barbell', pat:'Hinge',           uni:false },
  { name:'Pull-Up',            p:'lats',        s:['biceps','upper back'],             cat:'compound', eq:'Bodyweight', pat:'Vertical pull', uni:false },
  { name:'Overhead Press',     p:'front delts', s:['triceps','side delts'],            cat:'compound', eq:'Barbell', pat:'Vertical push',   uni:false },
  { name:'Barbell Row',        p:'upper back',  s:['lats','biceps','rear delts'],      cat:'compound', eq:'Barbell', pat:'Horizontal pull', uni:false },
];
