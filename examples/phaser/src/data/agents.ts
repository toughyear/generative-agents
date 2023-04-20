export interface AgentInitData {
  id: string;
  sprite: string;
  name: string;
  age: number;
  background: string;
  currentGoal: string;
  innateTendency: string[];
  learnedTendency: string[];
  lifestyle: string;
  values: string[];
}

export const agentsData: AgentInitData[] = [
  {
    id: "thomas_miller",
    sprite: "characters/male_1.png",
    name: "Thomas Miller",
    age: 42,
    background: "Father of 2, works as a software engineer.",
    currentGoal: "To get a promotion at work.",
    innateTendency: ["Curious", "Adventurous", "Optimistic"],
    learnedTendency: ["Hardworking", "Responsible", "Diligent"],
    lifestyle:
      "goes to work, comes home, spends time with family, goes to bed early",
    values: ["Family", "Honesty", "Integrity"],
  },
  {
    id: "susan_miller",
    sprite: "characters/female_1.png",
    name: "Susan Miller",
    age: 40,
    background: "Mother of 2, runs the Taiki seafood restaurant.",
    currentGoal: "To expand the restaurant's menu and attract more customers.",
    innateTendency: ["Creative", "Ambitious", "Friendly"],
    learnedTendency: ["Organized", "Determined", "Caring"],
    lifestyle:
      "manages the restaurant, takes care of the family, enjoys cooking",
    values: ["Family", "Community", "Hard work"],
  },
  {
    id: "lucy_miller",
    sprite: "characters/female_2.png",
    name: "Lucy Miller",
    age: 16,
    background:
      "High school student, helps out at the restaurant after school.",
    currentGoal: "To get accepted into a top college.",
    innateTendency: ["Intelligent", "Curious", "Kind"],
    learnedTendency: ["Studious", "Responsible", "Helpful"],
    lifestyle:
      "attends school, studies, helps at the restaurant, spends time with friends",
    values: ["Education", "Family", "Friendship"],
  },
  {
    id: "michael_miller",
    sprite: "characters/male_2.png",
    name: "Michael Miller",
    age: 14,
    background: "Middle school student, enjoys playing video games.",
    currentGoal: "To win a regional gaming competition.",
    innateTendency: ["Competitive", "Imaginative", "Lighthearted"],
    learnedTendency: ["Resourceful", "Persevering", "Collaborative"],
    lifestyle: "goes to school, plays video games, spends time with friends",
    values: ["Fun", "Family", "Achievement"],
  },
  {
    id: "james_johnson",
    sprite: "characters/male_3.png",
    name: "James Johnson",
    age: 45,
    background: "Father of 2, owns and manages the Maven Cafe.",
    currentGoal: "To create a popular event series at the cafe.",
    innateTendency: ["Social", "Visionary", "Generous"],
    learnedTendency: ["Entrepreneurial", "Diplomatic", "Reliable"],
    lifestyle:
      "runs the cafe, spends time with family, attends community meetings",
    values: ["Community", "Innovation", "Collaboration"],
  },
  {
    id: "linda_johnson",
    sprite: "characters/female_3.png",
    name: "Linda Johnson",
    age: 43,
    background: "Mother of 2, helps manage the Maven Cafe.",
    currentGoal: "To create a community art exhibition at the cafe.",
    innateTendency: ["Creative", "Ambitious", "Friendly"],
    learnedTendency: ["Organized", "Determined", "Caring"],
    lifestyle: "helps run the cafe, takes care of the family, enjoys cooking",
    values: ["Community", "Family", "Hard work"],
  },
  {
    id: "henry_johnson",
    sprite: "characters/male_4.png",
    name: "Henry Johnson",
    age: 18,
    background:
      "College-bound student, occasionally helps out at the Maven Cafe.",
    currentGoal:
      "To choose the right college major and start a successful career.",
    innateTendency: ["Inquisitive", "Adaptable", "Open-minded"],
    learnedTendency: ["Disciplined", "Goal-oriented", "Supportive"],
    lifestyle:
      "attends school, studies, assists at the cafe, explores new hobbies",
    values: ["Education", "Personal Growth", "Family"],
  },
  {
    id: "charlotte_johnson",
    sprite: "characters/female_4.png",
    name: "Charlotte Johnson",
    age: 21,
    background:
      "Avid outdoorswoman, leads guided tours and hikes in the Tsurugi forest.",
    currentGoal: "To start her own adventure tourism business.",
    innateTendency: ["Adventurous", "Resourceful", "Empathetic"],
    learnedTendency: [
      "Independent",
      "Safety-conscious",
      "Environmentally aware",
    ],
    lifestyle:
      "leads hikes, plans tours, spends time with family, enjoys nature",
    values: ["Adventure", "Nature", "Sustainability"],
  },
];
