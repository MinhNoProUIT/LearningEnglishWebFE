"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Box,
  Paper,
  Typography,
  Button,
  Stack,
  Grid,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  LinearProgress,
  Tooltip,
  Radio,
  RadioGroup,
  FormControlLabel,
  TextField,
  Checkbox,
  FormGroup,
} from "@mui/material";
import {
  ArrowLeft,
  Clock,
  Flag,
  Send,
  ChevronLeft,
  ChevronRight,
  Headphones,
  Play,
  Volume2,
  AlertTriangle,
  FileText,
  BookOpen,
  CheckSquare,
  Edit3,
  List,
} from "lucide-react";
import { examTheme } from "@/components/exam";

const theme = examTheme;

// ================== TYPES ==================
type QuestionType =
  | "multiple-choice"
  | "true-false-notgiven"
  | "yes-no-notgiven"
  | "matching-headings"
  | "matching-information"
  | "matching-features"
  | "sentence-completion"
  | "summary-completion"
  | "note-completion"
  | "table-completion"
  | "flowchart-completion"
  | "diagram-labeling"
  | "short-answer"
  | "form-completion"
  | "plan-map-labeling";

type Question = {
  id: number;
  sectionId: number;
  type: QuestionType;
  audioUrl?: string;
  passage?: string;
  passageTitle?: string;
  questionText?: string;
  instructions?: string;
  options?: { label: string; text: string }[];
  // For matching questions
  matchingOptions?: string[];
  statements?: { id: number; text: string }[];
  // For fill-in-blank questions
  blankCount?: number;
  maxWords?: number;
  // Sub-questions for grouped questions
  subQuestions?: {
    id: number;
    questionText: string;
    options?: { label: string; text: string }[];
    blankLabel?: string;
  }[];
};

type Section = {
  id: number;
  name: string;
  category: "Listening" | "Reading";
  questionCount: number;
  startQuestion: number;
  endQuestion: number;
  icon: string;
  instructions: string;
  timeLimit?: number; // minutes
};

// ================== IELTS SECTIONS ==================
const sections: Section[] = [
  // LISTENING (4 sections, 40 questions)
  {
    id: 1,
    name: "Section 1",
    category: "Listening",
    questionCount: 10,
    startQuestion: 1,
    endQuestion: 10,
    icon: "Headphones",
    instructions: "Nghe hội thoại giữa 2 người về chủ đề đời thường và trả lời các câu hỏi.",
  },
  {
    id: 2,
    name: "Section 2",
    category: "Listening",
    questionCount: 10,
    startQuestion: 11,
    endQuestion: 20,
    icon: "Volume2",
    instructions: "Nghe bài độc thoại về chủ đề đời thường và trả lời các câu hỏi.",
  },
  {
    id: 3,
    name: "Section 3",
    category: "Listening",
    questionCount: 10,
    startQuestion: 21,
    endQuestion: 30,
    icon: "Headphones",
    instructions: "Nghe hội thoại giữa 2-4 người trong bối cảnh học thuật và trả lời các câu hỏi.",
  },
  {
    id: 4,
    name: "Section 4",
    category: "Listening",
    questionCount: 10,
    startQuestion: 31,
    endQuestion: 40,
    icon: "Volume2",
    instructions: "Nghe bài giảng học thuật và trả lời các câu hỏi.",
  },
  // READING (3 passages, 40 questions)
  {
    id: 5,
    name: "Passage 1",
    category: "Reading",
    questionCount: 13,
    startQuestion: 41,
    endQuestion: 53,
    icon: "BookOpen",
    instructions: "Đọc đoạn văn và trả lời các câu hỏi. Bạn có thể quay lại các câu trước.",
    timeLimit: 20,
  },
  {
    id: 6,
    name: "Passage 2",
    category: "Reading",
    questionCount: 13,
    startQuestion: 54,
    endQuestion: 66,
    icon: "BookOpen",
    instructions: "Đọc đoạn văn và trả lời các câu hỏi. Bạn có thể quay lại các câu trước.",
    timeLimit: 20,
  },
  {
    id: 7,
    name: "Passage 3",
    category: "Reading",
    questionCount: 14,
    startQuestion: 67,
    endQuestion: 80,
    icon: "BookOpen",
    instructions: "Đọc đoạn văn và trả lời các câu hỏi. Bạn có thể quay lại các câu trước.",
    timeLimit: 20,
  },
];

// ================== MOCK QUESTIONS ==================
const mockQuestions: Question[] = [];

// Section 1 - Listening: Form completion (hotel booking)
mockQuestions.push({
  id: 1,
  sectionId: 1,
  type: "form-completion",
  audioUrl: "/audio/ielts/section1.mp3",
  instructions: "Complete the form below. Write NO MORE THAN TWO WORDS AND/OR A NUMBER for each answer.",
  passage: `HOTEL BOOKING FORM

Guest name: Sarah _______ (1)
Contact number: _______ (2)
Email: sarah.wilson@_______ (3)
Check-in date: 15th _______ (4)
Number of nights: _______ (5)
Room type: _______ (6) room
Special requests: _______ (7) floor preferred
Payment method: _______ (8)`,
  maxWords: 2,
  subQuestions: [
    { id: 1, questionText: "Guest surname", blankLabel: "1" },
    { id: 2, questionText: "Contact number", blankLabel: "2" },
    { id: 3, questionText: "Email domain", blankLabel: "3" },
    { id: 4, questionText: "Check-in month", blankLabel: "4" },
    { id: 5, questionText: "Number of nights", blankLabel: "5" },
    { id: 6, questionText: "Room type", blankLabel: "6" },
    { id: 7, questionText: "Floor preference", blankLabel: "7" },
    { id: 8, questionText: "Payment method", blankLabel: "8" },
  ],
});

// Section 1 - Multiple choice
mockQuestions.push({
  id: 9,
  sectionId: 1,
  type: "multiple-choice",
  audioUrl: "/audio/ielts/section1.mp3",
  questionText: "What time does the hotel restaurant open for breakfast?",
  options: [
    { label: "A", text: "6:00 AM" },
    { label: "B", text: "6:30 AM" },
    { label: "C", text: "7:00 AM" },
  ],
});

mockQuestions.push({
  id: 10,
  sectionId: 1,
  type: "multiple-choice",
  audioUrl: "/audio/ielts/section1.mp3",
  questionText: "What is included in the room rate?",
  options: [
    { label: "A", text: "Breakfast only" },
    { label: "B", text: "Breakfast and parking" },
    { label: "C", text: "All meals" },
  ],
});

// Section 2 - Listening: Matching and Multiple choice
mockQuestions.push({
  id: 11,
  sectionId: 2,
  type: "matching-features",
  audioUrl: "/audio/ielts/section2.mp3",
  instructions: "What does the speaker say about each facility? Match each facility with the correct description.",
  matchingOptions: [
    "A. Open 24 hours",
    "B. Booking required",
    "C. Free for members",
    "D. Temporarily closed",
    "E. Extra fee applies",
  ],
  subQuestions: [
    { id: 11, questionText: "Swimming pool" },
    { id: 12, questionText: "Tennis courts" },
    { id: 13, questionText: "Fitness center" },
    { id: 14, questionText: "Sauna" },
    { id: 15, questionText: "Restaurant" },
  ],
});

mockQuestions.push({
  id: 16,
  sectionId: 2,
  type: "multiple-choice",
  audioUrl: "/audio/ielts/section2.mp3",
  questionText: "When was the community center first opened?",
  options: [
    { label: "A", text: "1985" },
    { label: "B", text: "1995" },
    { label: "C", text: "2005" },
  ],
});

// Continue Section 2 with note completion
mockQuestions.push({
  id: 17,
  sectionId: 2,
  type: "note-completion",
  audioUrl: "/audio/ielts/section2.mp3",
  instructions: "Complete the notes below. Write NO MORE THAN TWO WORDS for each answer.",
  passage: `Community Center Events

- Annual festival: held in _______ (17)
- Art exhibition: features works by _______ (18) artists
- Children's program: runs every _______ (19)
- Membership fee: £_______ (20) per year`,
  maxWords: 2,
  subQuestions: [
    { id: 17, questionText: "Festival month", blankLabel: "17" },
    { id: 18, questionText: "Artist type", blankLabel: "18" },
    { id: 19, questionText: "Program schedule", blankLabel: "19" },
    { id: 20, questionText: "Annual fee", blankLabel: "20" },
  ],
});

// Section 3 - Listening: Academic discussion
mockQuestions.push({
  id: 21,
  sectionId: 3,
  type: "multiple-choice",
  audioUrl: "/audio/ielts/section3.mp3",
  instructions: "Choose the correct letter, A, B or C.",
  subQuestions: [
    {
      id: 21,
      questionText: "What is the main topic of the students' research project?",
      options: [
        { label: "A", text: "Climate change effects on agriculture" },
        { label: "B", text: "Sustainable farming methods" },
        { label: "C", text: "Water conservation techniques" },
      ],
    },
    {
      id: 22,
      questionText: "The professor suggests that the students should",
      options: [
        { label: "A", text: "focus on one specific region" },
        { label: "B", text: "compare different countries" },
        { label: "C", text: "include historical data" },
      ],
    },
    {
      id: 23,
      questionText: "What problem does Maria mention about their initial approach?",
      options: [
        { label: "A", text: "Lack of reliable data" },
        { label: "B", text: "Time constraints" },
        { label: "C", text: "Limited access to farmers" },
      ],
    },
  ],
});

mockQuestions.push({
  id: 24,
  sectionId: 3,
  type: "matching-features",
  audioUrl: "/audio/ielts/section3.mp3",
  instructions: "Which student will be responsible for each task?",
  matchingOptions: ["A. Maria", "B. James", "C. Both students"],
  subQuestions: [
    { id: 24, questionText: "Conducting interviews" },
    { id: 25, questionText: "Analyzing statistics" },
    { id: 26, questionText: "Writing the introduction" },
    { id: 27, questionText: "Creating visual presentations" },
  ],
});

mockQuestions.push({
  id: 28,
  sectionId: 3,
  type: "sentence-completion",
  audioUrl: "/audio/ielts/section3.mp3",
  instructions: "Complete the sentences below. Write NO MORE THAN TWO WORDS for each answer.",
  subQuestions: [
    { id: 28, questionText: "The deadline for the first draft is the end of _______." },
    { id: 29, questionText: "Students must include at least _______ case studies." },
    { id: 30, questionText: "The final presentation should last approximately _______ minutes." },
  ],
  maxWords: 2,
});

// Section 4 - Listening: Academic lecture
mockQuestions.push({
  id: 31,
  sectionId: 4,
  type: "sentence-completion",
  audioUrl: "/audio/ielts/section4.mp3",
  instructions: "Complete the notes below. Write ONE WORD ONLY for each answer.",
  passage: `The History of Urban Planning

Ancient Cities:
- First planned cities appeared in _______ (31) around 2600 BCE
- Grid patterns were used for _______ (32) purposes
- Public spaces were central to _______ (33) life

Medieval Period:
- Cities grew _______ (34) without formal planning
- Walls were built for _______ (35) reasons
- Markets became the _______ (36) of economic activity

Modern Era:
- Industrial Revolution led to _______ (37) problems
- Garden City movement promoted _______ (38) spaces
- Zoning laws separated _______ (39) and commercial areas
- Current focus is on _______ (40) development`,
  maxWords: 1,
  subQuestions: [
    { id: 31, questionText: "Location of first planned cities", blankLabel: "31" },
    { id: 32, questionText: "Purpose of grid patterns", blankLabel: "32" },
    { id: 33, questionText: "Central to what type of life", blankLabel: "33" },
    { id: 34, questionText: "How cities grew", blankLabel: "34" },
    { id: 35, questionText: "Purpose of walls", blankLabel: "35" },
    { id: 36, questionText: "Role of markets", blankLabel: "36" },
    { id: 37, questionText: "Type of problems", blankLabel: "37" },
    { id: 38, questionText: "Type of spaces promoted", blankLabel: "38" },
    { id: 39, questionText: "What was separated", blankLabel: "39" },
    { id: 40, questionText: "Current focus", blankLabel: "40" },
  ],
});

// READING PASSAGE 1
const readingPassage1 = `THE HISTORY OF CHOCOLATE

A. The story of chocolate begins with the ancient civilizations of Mesoamerica, where the cacao tree (Theobroma cacao) has been cultivated for at least three millennia. The Olmecs, who lived in what is now southern Mexico around 1500 BCE, are believed to have been the first to discover that cacao beans could be processed into a beverage. Archaeological evidence suggests they fermented, roasted, and ground the beans to create a bitter drink that was likely used in rituals.

B. The Maya civilization, which flourished from 250 to 900 CE, elevated cacao to sacred status. They believed the cacao tree was a gift from the gods, and cacao beans were so valuable they were used as currency. The Maya prepared chocolate as a frothy drink mixed with water, chili peppers, and cornmeal. This beverage was reserved for royalty, warriors, and priests, and was consumed during important ceremonies and celebrations.

C. When the Aztecs came to power in the 14th century, they continued the tradition of chocolate consumption but added their own innovations. The Aztec emperor Montezuma II reportedly drank fifty cups of chocolate daily from golden goblets. The Aztecs called their chocolate drink "xocolatl" (meaning "bitter water"), and it was believed to provide wisdom, energy, and enhanced romantic desire. Cacao beans remained a form of currency, with one bean reportedly able to buy a tomato and 100 beans purchasing a turkey.

D. The European discovery of chocolate occurred when Spanish conquistador Hernán Cortés arrived in Mexico in 1519. Although Cortés initially found the bitter drink unpalatable, he recognized its economic potential and brought cacao beans back to Spain. The Spanish court began experimenting with the recipe, adding sugar and honey to make it more appealing to European tastes. They also heated the drink, a departure from the cold preparation preferred in Mesoamerica.

E. For nearly a century, Spain kept chocolate a closely guarded secret. However, when Spanish princess Maria Theresa married French King Louis XIV in 1660, she brought her love of chocolate to the French court, and from there it spread throughout Europe. Chocolate houses, similar to coffee houses, became popular gathering places for the aristocracy in major European cities during the 17th and 18th centuries.

F. The Industrial Revolution transformed chocolate from a luxury drink into an accessible food product. In 1828, Dutch chemist Coenraad van Houten invented the cocoa press, which could separate cocoa butter from roasted cacao beans. This innovation made it possible to produce cocoa powder, which was easier to mix with water and sugar. In 1847, English company J.S. Fry & Sons created the first modern chocolate bar by combining cocoa powder, sugar, and melted cocoa butter.

G. The late 19th century saw further innovations. In Switzerland, Daniel Peter added milk to chocolate in 1875, creating milk chocolate. His countryman Rodolphe Lindt invented the conching machine in 1879, which produced smoother, more refined chocolate. These Swiss innovations established the country's reputation for high-quality chocolate that continues today.

H. Today, chocolate is a global industry worth over $130 billion annually. The majority of cacao is now grown in West Africa, with Côte d'Ivoire and Ghana producing about 60% of the world's supply. However, the industry faces challenges including concerns about sustainable farming practices, fair wages for farmers, and the environmental impact of cacao cultivation. Many companies are now investing in ethical sourcing programs to address these issues while ensuring the future of this beloved treat.`;

mockQuestions.push({
  id: 41,
  sectionId: 5,
  type: "matching-headings",
  passage: readingPassage1,
  passageTitle: "THE HISTORY OF CHOCOLATE",
  instructions: "The reading passage has eight paragraphs, A-H. Choose the correct heading for each paragraph from the list of headings below.",
  matchingOptions: [
    "i. The spread of chocolate across Europe",
    "ii. Modern challenges facing the chocolate industry",
    "iii. The sacred drink of the Maya",
    "iv. European modifications to chocolate",
    "v. The origins of cacao cultivation",
    "vi. Swiss contributions to chocolate making",
    "vii. The Aztec empire and chocolate currency",
    "viii. Industrial advances in chocolate production",
    "ix. The health benefits of chocolate",
    "x. Spanish discovery and initial reactions",
  ],
  subQuestions: [
    { id: 41, questionText: "Paragraph A" },
    { id: 42, questionText: "Paragraph B" },
    { id: 43, questionText: "Paragraph C" },
    { id: 44, questionText: "Paragraph D" },
    { id: 45, questionText: "Paragraph E" },
    { id: 46, questionText: "Paragraph F" },
    { id: 47, questionText: "Paragraph G" },
    { id: 48, questionText: "Paragraph H" },
  ],
});

mockQuestions.push({
  id: 49,
  sectionId: 5,
  type: "true-false-notgiven",
  passage: readingPassage1,
  passageTitle: "THE HISTORY OF CHOCOLATE",
  instructions: "Do the following statements agree with the information given in the passage? Write TRUE if the statement agrees with the information, FALSE if the statement contradicts the information, NOT GIVEN if there is no information on this.",
  subQuestions: [
    { id: 49, questionText: "The Olmecs used cacao beans as currency." },
    { id: 50, questionText: "The Maya mixed their chocolate drink with spices." },
    { id: 51, questionText: "Montezuma II drank chocolate from silver cups." },
    { id: 52, questionText: "The Spanish added sweeteners to make chocolate more palatable." },
    { id: 53, questionText: "Chocolate houses in Europe served food as well as drinks." },
  ],
});

// READING PASSAGE 2
const readingPassage2 = `ARTIFICIAL INTELLIGENCE IN HEALTHCARE

The integration of artificial intelligence (AI) into healthcare represents one of the most significant technological shifts in modern medicine. From diagnostic imaging to drug discovery, AI systems are being deployed across virtually every aspect of healthcare delivery, promising to improve patient outcomes while reducing costs. However, this transformation also raises important questions about privacy, liability, and the changing role of healthcare professionals.

Diagnostic Applications

Perhaps the most visible application of AI in healthcare is in diagnostic imaging. Machine learning algorithms have demonstrated remarkable accuracy in analyzing medical images, often matching or exceeding human performance. In 2017, Stanford researchers developed an AI system that could identify skin cancer with accuracy comparable to board-certified dermatologists. Similarly, Google's DeepMind has created algorithms that can detect over 50 eye diseases from retinal scans with 94% accuracy.

These systems work by analyzing vast datasets of labeled medical images, learning to identify patterns associated with specific conditions. A radiologist might review thousands of chest X-rays over their career; an AI system can analyze millions, potentially identifying subtle patterns that escape human notice. This capability is particularly valuable in screening programs, where AI can quickly flag potentially problematic images for human review.

Drug Discovery and Development

The traditional drug development process is notoriously lengthy and expensive, typically requiring 10-15 years and billions of dollars to bring a new medication to market. AI is accelerating this process by analyzing molecular structures and predicting which compounds are most likely to be effective against specific diseases. In 2020, AI played a crucial role in identifying potential treatments for COVID-19, with algorithms screening thousands of existing drugs for repurposing possibilities.

Companies like Insilico Medicine and Atomwise are using AI to design entirely new molecules with desired therapeutic properties. These systems can generate and evaluate millions of potential drug candidates in days rather than years, dramatically reducing the time and cost of early-stage drug discovery.

Personalized Medicine

AI enables a more personalized approach to healthcare by analyzing individual patient data to predict disease risk and optimize treatment plans. By examining genetic information, medical history, lifestyle factors, and environmental data, AI systems can identify patients who are most likely to benefit from specific interventions or who are at elevated risk for certain conditions.

This capability is particularly promising in oncology, where AI can analyze tumor genetics to recommend targeted therapies. Rather than a one-size-fits-all approach to cancer treatment, AI enables oncologists to select medications most likely to be effective for each patient's specific cancer type.

Challenges and Concerns

Despite its promise, AI in healthcare faces significant challenges. Data privacy is a paramount concern, as these systems require access to sensitive patient information to function effectively. Healthcare organizations must balance the potential benefits of AI with their obligation to protect patient confidentiality.

Questions of liability also arise when AI systems are involved in medical decision-making. If an AI-assisted diagnosis proves incorrect, who bears responsibility—the physician, the hospital, or the technology company? These questions remain largely unresolved in most jurisdictions.

There are also concerns about algorithmic bias. AI systems trained on historical data may perpetuate existing healthcare disparities if that data reflects past inequities. Studies have found that some AI systems perform less accurately for certain demographic groups, potentially exacerbating rather than reducing healthcare inequalities.

The Future Landscape

Looking ahead, AI will likely become an increasingly integral part of healthcare delivery. Rather than replacing physicians, these systems will augment human capabilities, handling routine tasks and providing decision support while freeing healthcare professionals to focus on complex cases and patient relationships.

The key to successful implementation lies in thoughtful integration that addresses ethical concerns while maximizing benefits. This requires collaboration between technologists, healthcare providers, policymakers, and patients to ensure that AI serves the fundamental goal of healthcare: improving human health and wellbeing.`;

mockQuestions.push({
  id: 54,
  sectionId: 6,
  type: "multiple-choice",
  passage: readingPassage2,
  passageTitle: "ARTIFICIAL INTELLIGENCE IN HEALTHCARE",
  instructions: "Choose the correct letter, A, B, C or D.",
  subQuestions: [
    {
      id: 54,
      questionText: "According to the passage, AI diagnostic systems work by",
      options: [
        { label: "A", text: "replacing the need for human doctors" },
        { label: "B", text: "learning patterns from large amounts of medical data" },
        { label: "C", text: "providing second opinions for difficult cases only" },
        { label: "D", text: "operating independently without human oversight" },
      ],
    },
    {
      id: 55,
      questionText: "The passage suggests that AI in drug discovery",
      options: [
        { label: "A", text: "has completely replaced traditional research methods" },
        { label: "B", text: "is only useful for treating COVID-19" },
        { label: "C", text: "can significantly speed up the development process" },
        { label: "D", text: "is too expensive to be practical" },
      ],
    },
    {
      id: 56,
      questionText: "What concern about AI systems is mentioned regarding healthcare disparities?",
      options: [
        { label: "A", text: "They are too expensive for poorer patients" },
        { label: "B", text: "They may not work as well for all demographic groups" },
        { label: "C", text: "They are not available in rural areas" },
        { label: "D", text: "They require internet access to function" },
      ],
    },
  ],
});

mockQuestions.push({
  id: 57,
  sectionId: 6,
  type: "yes-no-notgiven",
  passage: readingPassage2,
  passageTitle: "ARTIFICIAL INTELLIGENCE IN HEALTHCARE",
  instructions: "Do the following statements agree with the views of the writer? Write YES if the statement agrees with the views of the writer, NO if the statement contradicts the views of the writer, NOT GIVEN if it is impossible to say what the writer thinks about this.",
  subQuestions: [
    { id: 57, questionText: "AI will eventually make human doctors unnecessary." },
    { id: 58, questionText: "The legal framework for AI liability in healthcare is well established." },
    { id: 59, questionText: "Collaboration between different stakeholders is essential for successful AI implementation." },
    { id: 60, questionText: "AI systems should have access to all patient data without restrictions." },
  ],
});

mockQuestions.push({
  id: 61,
  sectionId: 6,
  type: "sentence-completion",
  passage: readingPassage2,
  passageTitle: "ARTIFICIAL INTELLIGENCE IN HEALTHCARE",
  instructions: "Complete the sentences below. Choose NO MORE THAN TWO WORDS from the passage for each answer.",
  subQuestions: [
    { id: 61, questionText: "Stanford researchers created an AI system to identify _______ with high accuracy." },
    { id: 62, questionText: "AI can analyze tumor genetics to recommend _______ therapies for cancer patients." },
    { id: 63, questionText: "AI systems trained on historical data may perpetuate existing _______." },
  ],
  maxWords: 2,
});

mockQuestions.push({
  id: 64,
  sectionId: 6,
  type: "matching-information",
  passage: readingPassage2,
  passageTitle: "ARTIFICIAL INTELLIGENCE IN HEALTHCARE",
  instructions: "Which section contains the following information? Write the correct letter, A-G.",
  matchingOptions: [
    "A. Diagnostic Applications",
    "B. Drug Discovery and Development",
    "C. Personalized Medicine",
    "D. Challenges and Concerns",
    "E. The Future Landscape",
  ],
  subQuestions: [
    { id: 64, questionText: "A reference to AI identifying patterns humans might miss" },
    { id: 65, questionText: "Discussion of who is responsible when AI makes mistakes" },
    { id: 66, questionText: "The prediction that AI will support rather than replace doctors" },
  ],
});

// READING PASSAGE 3
const readingPassage3 = `THE SCIENCE OF SLEEP

Sleep remains one of the most mysterious aspects of human biology. Despite spending approximately one-third of our lives asleep, scientists are still uncovering the fundamental mechanisms and purposes of this essential state. Recent research has revealed that sleep is far more than mere rest—it is an active process crucial for physical health, cognitive function, and emotional wellbeing.

The Architecture of Sleep

Sleep is not a uniform state but rather a complex cycle of distinct stages. A typical night's sleep consists of four to six cycles, each lasting approximately 90 minutes. Within each cycle, the brain moves through several stages: light sleep (stages 1 and 2), deep sleep (stage 3, also called slow-wave sleep), and REM (rapid eye movement) sleep.

During light sleep, the body begins to relax, heart rate slows, and brain activity decreases. This transitional phase typically occupies about 50% of total sleep time in adults. Deep sleep, which dominates the first half of the night, is characterized by slow brain waves called delta waves. This stage is crucial for physical restoration—growth hormone is released, tissue repair occurs, and the immune system is strengthened.

REM sleep, which increases in duration toward morning, is when most dreaming occurs. Despite the body being essentially paralyzed during this stage (a phenomenon called atonia), the brain is highly active, with electrical patterns similar to wakefulness. REM sleep appears critical for memory consolidation, emotional processing, and learning.

The Glymphatic System

One of the most significant recent discoveries about sleep concerns the brain's waste clearance mechanism. In 2012, researchers at the University of Rochester discovered the glymphatic system—a network that flushes toxic waste products from the brain during sleep.

During wakefulness, metabolic activity produces various byproducts, including beta-amyloid, a protein associated with Alzheimer's disease. The glymphatic system, which is 10 times more active during sleep than during waking hours, clears these potentially harmful substances. This finding provides a compelling explanation for why sleep deprivation impairs cognitive function and may contribute to neurodegenerative diseases.

The system works by allowing cerebrospinal fluid to flow through channels around brain blood vessels, picking up waste and carrying it away for disposal. Brain cells actually shrink during sleep, creating more space for this cleaning process to occur efficiently.

Sleep and Memory

The relationship between sleep and memory has been extensively studied, revealing that sleep is not merely a passive state of rest but an active period of memory processing. Different sleep stages appear to serve distinct memory functions.

During slow-wave sleep, the brain replays and consolidates declarative memories—facts and events. Studies have shown that people who sleep after learning new information retain it better than those who remain awake for an equivalent period. This process involves the transfer of memories from the hippocampus, where they are initially stored, to the neocortex for long-term storage.

REM sleep, by contrast, appears more important for procedural memories—skills and how-to knowledge. Musicians, athletes, and language learners all show improved performance after REM-rich sleep. Additionally, REM sleep seems to help process emotional memories, potentially explaining why sleep disturbances are common in mood disorders.

The Consequences of Sleep Deprivation

Modern society's tendency to undervalue sleep has significant health implications. Chronic sleep deprivation—defined as regularly getting less than seven hours per night for adults—is associated with numerous adverse outcomes.

Cardiovascular health is particularly affected. Sleep deprivation increases inflammation, raises blood pressure, and disrupts glucose metabolism. Studies have found that people who regularly sleep less than six hours per night have a 20% higher risk of heart attack compared to those who sleep seven to eight hours.

Cognitive effects are equally concerning. Even moderate sleep loss impairs attention, decision-making, and reaction time—effects comparable to alcohol intoxication. A person who has been awake for 17 hours shows cognitive impairment equivalent to a blood alcohol level of 0.05%, the legal driving limit in many countries.

Sleep deprivation also affects emotional regulation. The amygdala, the brain's emotional center, becomes hyperactive without adequate sleep, leading to increased irritability, anxiety, and emotional volatility. This may explain the strong bidirectional relationship between sleep problems and mental health conditions.

Circadian Rhythms and Modern Life

Human sleep is governed by circadian rhythms—internal biological clocks that follow an approximately 24-hour cycle. These rhythms are primarily synchronized by light exposure, with bright light suppressing melatonin production and signaling wakefulness.

Modern technology poses challenges for healthy sleep. The blue light emitted by screens can delay melatonin release, making it harder to fall asleep. Additionally, the constant connectivity enabled by smartphones can create anxiety and stimulation that interfere with sleep onset.

Shift work presents particular challenges, requiring people to sleep when their circadian biology promotes wakefulness and vice versa. Shift workers have higher rates of obesity, diabetes, cardiovascular disease, and certain cancers—likely due to chronic circadian disruption.

Improving Sleep Quality

Research suggests several evidence-based strategies for improving sleep. Maintaining a consistent sleep schedule—going to bed and waking at the same time daily—helps regulate circadian rhythms. Creating a cool, dark, quiet sleep environment optimizes conditions for rest. Limiting caffeine and alcohol, particularly in the hours before bed, can improve sleep quality. Regular physical activity promotes better sleep, though intense exercise close to bedtime may be counterproductive.

Perhaps most importantly, recognizing sleep as essential rather than optional represents a necessary cultural shift. Just as we prioritize nutrition and exercise, adequate sleep should be viewed as a fundamental component of health. The science is clear: we cannot function optimally—physically, cognitively, or emotionally—without sufficient rest.`;

mockQuestions.push({
  id: 67,
  sectionId: 7,
  type: "matching-headings",
  passage: readingPassage3,
  passageTitle: "THE SCIENCE OF SLEEP",
  instructions: "Choose the correct heading for each section from the list of headings below.",
  matchingOptions: [
    "i. How lack of sleep affects the heart and mind",
    "ii. The brain's self-cleaning mechanism during sleep",
    "iii. Practical recommendations for better sleep",
    "iv. The different phases of a sleep cycle",
    "v. How modern devices disrupt natural sleep patterns",
    "vi. The role of sleep in forming memories",
    "vii. Why humans need exactly eight hours of sleep",
    "viii. The connection between sleep and dreaming",
  ],
  subQuestions: [
    { id: 67, questionText: "The Architecture of Sleep" },
    { id: 68, questionText: "The Glymphatic System" },
    { id: 69, questionText: "Sleep and Memory" },
    { id: 70, questionText: "The Consequences of Sleep Deprivation" },
    { id: 71, questionText: "Circadian Rhythms and Modern Life" },
    { id: 72, questionText: "Improving Sleep Quality" },
  ],
});

mockQuestions.push({
  id: 73,
  sectionId: 7,
  type: "summary-completion",
  passage: readingPassage3,
  passageTitle: "THE SCIENCE OF SLEEP",
  instructions: "Complete the summary below. Choose NO MORE THAN TWO WORDS from the passage for each answer.",
  passage: `THE GLYMPHATIC SYSTEM

Scientists discovered that during sleep, the brain has a cleaning mechanism called the glymphatic system. This system removes (73) _______ from the brain, including beta-amyloid protein linked to Alzheimer's disease. The system operates by circulating (74) _______ through channels around blood vessels. To make this process more efficient, brain cells (75) _______ during sleep, which creates additional space for waste removal.`,
  subQuestions: [
    { id: 73, questionText: "What is removed from the brain" },
    { id: 74, questionText: "What fluid circulates through channels" },
    { id: 75, questionText: "What happens to brain cells during sleep" },
  ],
  maxWords: 2,
});

mockQuestions.push({
  id: 76,
  sectionId: 7,
  type: "true-false-notgiven",
  passage: readingPassage3,
  passageTitle: "THE SCIENCE OF SLEEP",
  instructions: "Do the following statements agree with the information given in the passage?",
  subQuestions: [
    { id: 76, questionText: "Deep sleep occurs more frequently in the second half of the night." },
    { id: 77, questionText: "The glymphatic system is equally active during sleep and wakefulness." },
    { id: 78, questionText: "REM sleep helps with learning physical skills." },
    { id: 79, questionText: "Being awake for 17 hours causes the same impairment as being legally drunk in all countries." },
    { id: 80, questionText: "Exercise right before bed is beneficial for sleep quality." },
  ],
});

// ================== TIMER COMPONENT ==================
const ExamTimer = ({
  initialMinutes,
  onTimeUp,
}: {
  initialMinutes: number;
  onTimeUp: () => void;
}) => {
  const [timeLeft, setTimeLeft] = useState(initialMinutes * 60);

  useEffect(() => {
    if (timeLeft <= 0) {
      onTimeUp();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onTimeUp]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const isLowTime = timeLeft <= 300; // 5 minutes warning

  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <Clock size={18} color={isLowTime ? "#dc2626" : theme.colors.primary} />
      <Typography
        variant="subtitle1"
        fontWeight={700}
        sx={{ color: isLowTime ? "#dc2626" : "inherit" }}
      >
        {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
      </Typography>
    </Stack>
  );
};

// ================== QUESTION NAVIGATOR ==================
const QuestionNavigator = ({
  sections,
  answers,
  flaggedQuestions,
  currentQuestion,
  onQuestionClick,
  isListeningSection,
  listeningProgress,
}: {
  sections: Section[];
  answers: Record<number, string>;
  flaggedQuestions: Set<number>;
  currentQuestion: number;
  onQuestionClick: (questionId: number) => void;
  isListeningSection: boolean;
  listeningProgress: number;
}) => {
  return (
    <Paper sx={{ p: 2, borderRadius: 2, maxHeight: "calc(100vh - 200px)", overflow: "auto" }}>
      <Typography variant="subtitle2" fontWeight={700} mb={2}>
        Danh sách câu hỏi
      </Typography>

      {isListeningSection && (
        <Paper sx={{ p: 1.5, mb: 2, bgcolor: "#fef3c7", borderRadius: 2 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Headphones size={16} color="#d97706" />
            <Typography variant="caption" color="#92400e" fontWeight={600}>
              Phần Listening: Không thể quay lại câu trước
            </Typography>
          </Stack>
        </Paper>
      )}

      {sections.map((section) => {
        const isListeningPart = section.category === "Listening";
        const isReadingPart = section.category === "Reading";

        return (
          <Box key={section.id} mb={2}>
            <Stack direction="row" spacing={1} alignItems="center" mb={1}>
              <Chip
                label={section.category}
                size="small"
                sx={{
                  fontSize: "0.65rem",
                  height: 20,
                  bgcolor: isListeningPart ? "#dbeafe" : "#fef3c7",
                  color: isListeningPart ? "#1d4ed8" : "#92400e",
                }}
              />
              <Typography variant="caption" fontWeight={600} color="text.secondary">
                {section.name}
              </Typography>
            </Stack>

            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
              {Array.from(
                { length: section.endQuestion - section.startQuestion + 1 },
                (_, i) => section.startQuestion + i
              ).map((qNum) => {
                const isAnswered = answers[qNum] !== undefined && answers[qNum] !== "";
                const isFlagged = flaggedQuestions.has(qNum);
                const isCurrent = currentQuestion === qNum;

                const isListeningLocked = isListeningPart && qNum > listeningProgress;
                const isListeningPassed = isListeningPart && qNum < listeningProgress;
                const isReadingLockedDuringListening = isReadingPart && isListeningSection;
                const canClick = isListeningPart
                  ? qNum === currentQuestion
                  : !isReadingLockedDuringListening;

                return (
                  <Tooltip
                    key={qNum}
                    title={
                      isReadingLockedDuringListening
                        ? "Hoàn thành phần Listening trước"
                        : isListeningLocked
                        ? "Chưa đến câu này"
                        : isListeningPassed
                        ? "Không thể quay lại"
                        : `Câu ${qNum}${isAnswered ? " - Đã trả lời" : ""}${isFlagged ? " - Đã đánh dấu" : ""}`
                    }
                  >
                    <Box
                      onClick={() => (canClick ? onQuestionClick(qNum) : null)}
                      sx={{
                        width: 28,
                        height: 28,
                        borderRadius: 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.7rem",
                        fontWeight: 600,
                        cursor: canClick ? "pointer" : "not-allowed",
                        border: isCurrent ? `2px solid ${theme.colors.primary}` : "1px solid #e5e7eb",
                        bgcolor: isReadingLockedDuringListening || isListeningLocked
                          ? "#f3f4f6"
                          : isListeningPassed
                          ? isAnswered ? "#d1fae5" : "#fee2e2"
                          : isAnswered
                          ? "#d1fae5"
                          : isFlagged
                          ? "#fef3c7"
                          : "white",
                        color: isReadingLockedDuringListening || isListeningLocked
                          ? "#9ca3af"
                          : isListeningPassed
                          ? isAnswered ? theme.colors.primaryDark : "#dc2626"
                          : isAnswered
                          ? theme.colors.primaryDark
                          : isFlagged
                          ? "#92400e"
                          : "grey.600",
                        opacity: isListeningLocked || isReadingLockedDuringListening ? 0.5 : 1,
                        position: "relative",
                        "&:hover": canClick ? { borderColor: theme.colors.primary } : {},
                      }}
                    >
                      {qNum}
                      {isFlagged && !isListeningPart && (
                        <Flag
                          size={8}
                          color="#d97706"
                          fill="#d97706"
                          style={{ position: "absolute", top: 1, right: 1 }}
                        />
                      )}
                    </Box>
                  </Tooltip>
                );
              })}
            </Box>
          </Box>
        );
      })}

      <Box sx={{ mt: 2, pt: 2, borderTop: "1px solid #e5e7eb" }}>
        <Typography variant="caption" color="text.secondary" mb={1} display="block">
          Chú thích:
        </Typography>
        <Stack spacing={0.5}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Box sx={{ width: 16, height: 16, borderRadius: 0.5, bgcolor: "#d1fae5" }} />
            <Typography variant="caption">Đã trả lời</Typography>
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            <Box sx={{ width: 16, height: 16, borderRadius: 0.5, bgcolor: "#fef3c7" }} />
            <Typography variant="caption">Đã đánh dấu (Reading)</Typography>
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            <Box sx={{ width: 16, height: 16, borderRadius: 0.5, bgcolor: "#fee2e2" }} />
            <Typography variant="caption">Bỏ qua (Listening)</Typography>
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            <Box sx={{ width: 16, height: 16, borderRadius: 0.5, bgcolor: "white", border: "1px solid #e5e7eb" }} />
            <Typography variant="caption">Chưa trả lời</Typography>
          </Stack>
        </Stack>
      </Box>
    </Paper>
  );
};

// ================== MAIN PAGE ==================
export default function IeltsTestPage() {
  const router = useRouter();
  const params = useParams();
  const testId = params.id as string;

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<number>>(new Set());
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [listeningProgress, setListeningProgress] = useState(1);

  // Audio states
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioDuration] = useState(10);
  const [audioEnded, setAudioEnded] = useState(false);
  const [autoAdvanceCountdown, setAutoAdvanceCountdown] = useState<number | null>(null);
  const countdownStartedRef = useRef(false);

  const currentQuestionIndexRef = useRef(currentQuestionIndex);
  const listeningProgressRef = useRef(listeningProgress);

  const LISTENING_END = 40;
  const AUTO_ADVANCE_DELAY = 5;

  // Get all question IDs
  const allQuestionIds = React.useMemo(() => {
    const ids: number[] = [];
    mockQuestions.forEach((q) => {
      if (q.subQuestions) {
        q.subQuestions.forEach((sq) => ids.push(sq.id));
      } else {
        ids.push(q.id);
      }
    });
    return ids.sort((a, b) => a - b);
  }, []);

  const currentQuestionId = allQuestionIds[currentQuestionIndex];
  const isListeningSection = currentQuestionId <= LISTENING_END;
  const isReadingSection = currentQuestionId > LISTENING_END;

  // Find current question data
  const findQuestionData = (questionId: number) => {
    for (const q of mockQuestions) {
      if (q.subQuestions) {
        const subQ = q.subQuestions.find((sq) => sq.id === questionId);
        if (subQ) {
          return { question: null, subQuestion: subQ, parentQuestion: q };
        }
      } else if (q.id === questionId) {
        return { question: q, subQuestion: null, parentQuestion: null };
      }
    }
    return { question: null, subQuestion: null, parentQuestion: null };
  };

  const { question: currentQuestion, subQuestion, parentQuestion } = findQuestionData(currentQuestionId);

  // Sync refs
  useEffect(() => {
    currentQuestionIndexRef.current = currentQuestionIndex;
  }, [currentQuestionIndex]);

  useEffect(() => {
    listeningProgressRef.current = listeningProgress;
  }, [listeningProgress]);

  const handleAnswer = (questionId: number, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const handleFlag = (questionId: number) => {
    setFlaggedQuestions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  const handleQuestionClick = (questionId: number) => {
    const index = allQuestionIds.indexOf(questionId);
    if (index !== -1) {
      if (isListeningSection && questionId > listeningProgress) return;
      if (isListeningSection && questionId < listeningProgress) return;
      if (isListeningSection && questionId > LISTENING_END) return;
      setCurrentQuestionIndex(index);
    }
  };

  const handleNavigate = (direction: "prev" | "next") => {
    if (direction === "next" && currentQuestionIndex < allQuestionIds.length - 1) {
      if (isListeningSection && isAudioPlaying) return;

      const nextIndex = currentQuestionIndex + 1;
      const nextQuestionId = allQuestionIds[nextIndex];

      if (nextQuestionId <= LISTENING_END && nextQuestionId > listeningProgress) {
        setListeningProgress(nextQuestionId);
      }

      setAutoAdvanceCountdown(null);
      setCurrentQuestionIndex(nextIndex);
    } else if (direction === "prev") {
      if (isListeningSection) return;

      if (currentQuestionIndex > 0) {
        const prevIndex = currentQuestionIndex - 1;
        const prevQuestionId = allQuestionIds[prevIndex];
        if (prevQuestionId > LISTENING_END) {
          setCurrentQuestionIndex(prevIndex);
        }
      }
    }
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      router.push(`/user/exam/ielts/fulltest/${testId}/result`);
    }, 1500);
  };

  const handleTimeUp = useCallback(() => {
    setShowSubmitDialog(true);
  }, []);

  // Audio auto-play for Listening
  useEffect(() => {
    if (isListeningSection) {
      setAudioProgress(0);
      setAudioEnded(false);
      setAutoAdvanceCountdown(null);
      countdownStartedRef.current = false;

      const startTimer = setTimeout(() => {
        setIsAudioPlaying(true);
      }, 500);

      return () => clearTimeout(startTimer);
    }
  }, [currentQuestionId, isListeningSection]);

  // Audio progress simulation
  useEffect(() => {
    if (!isAudioPlaying || !isListeningSection) return;

    const progressInterval = setInterval(() => {
      setAudioProgress((prev) => {
        if (prev >= audioDuration) {
          clearInterval(progressInterval);
          setIsAudioPlaying(false);
          setAudioEnded(true);
          return audioDuration;
        }
        return prev + 1;
      });
    }, 1000);

    return () => clearInterval(progressInterval);
  }, [isAudioPlaying, isListeningSection, audioDuration]);

  // Auto-advance countdown
  useEffect(() => {
    if (!audioEnded || !isListeningSection) return;
    if (countdownStartedRef.current) return;
    countdownStartedRef.current = true;

    let countdown = AUTO_ADVANCE_DELAY;
    setAutoAdvanceCountdown(countdown);

    const countdownInterval = setInterval(() => {
      countdown -= 1;
      if (countdown <= 0) {
        clearInterval(countdownInterval);
        setAutoAdvanceCountdown(null);
        const currentIdx = currentQuestionIndexRef.current;
        if (currentIdx < allQuestionIds.length - 1) {
          const nextIndex = currentIdx + 1;
          const nextQuestionId = allQuestionIds[nextIndex];
          if (nextQuestionId <= LISTENING_END && nextQuestionId > listeningProgressRef.current) {
            setListeningProgress(nextQuestionId);
          }
          setCurrentQuestionIndex(nextIndex);
        }
      } else {
        setAutoAdvanceCountdown(countdown);
      }
    }, 1000);

    return () => clearInterval(countdownInterval);
  }, [audioEnded, isListeningSection, allQuestionIds]);

  const answeredCount = Object.values(answers).filter((a) => a && a.trim() !== "").length;
  const totalQuestions = 80;
  const progress = (answeredCount / totalQuestions) * 100;

  // Render question based on type
  const renderQuestion = () => {
    const q = parentQuestion || currentQuestion;
    const sub = subQuestion;

    if (!q && !sub) return null;

    const questionType = q?.type || "multiple-choice";
    const questionInstructions = q?.instructions;
    const passage = q?.passage;
    const passageTitle = q?.passageTitle;

    return (
      <Box>
        {/* Instructions */}
        {questionInstructions && (
          <Paper sx={{ p: 2, mb: 3, bgcolor: "#f0fdf4", borderRadius: 2, border: "1px solid #d1fae5" }}>
            <Stack direction="row" spacing={1.5} alignItems="flex-start">
              <Edit3 size={18} color={theme.colors.primary} style={{ marginTop: 2 }} />
              <Typography variant="body2" color={theme.colors.primaryDark}>
                {questionInstructions}
              </Typography>
            </Stack>
          </Paper>
        )}

        {/* Passage for Reading */}
        {passage && isReadingSection && (
          <Paper sx={{ p: 3, mb: 3, bgcolor: "#f8fafc", borderRadius: 2, maxHeight: 400, overflow: "auto" }}>
            {passageTitle && (
              <Typography variant="h6" fontWeight={700} mb={2} color={theme.colors.primaryDark}>
                {passageTitle}
              </Typography>
            )}
            <Typography variant="body2" sx={{ whiteSpace: "pre-line", lineHeight: 2 }}>
              {passage}
            </Typography>
          </Paper>
        )}

        {/* Form/Note for Listening */}
        {passage && isListeningSection && (
          <Paper sx={{ p: 2, mb: 3, bgcolor: "#f8fafc", borderRadius: 2 }}>
            <Typography variant="body2" sx={{ whiteSpace: "pre-line", lineHeight: 1.8, fontFamily: "monospace" }}>
              {passage}
            </Typography>
          </Paper>
        )}

        {/* Matching Options */}
        {q?.matchingOptions && (
          <Paper sx={{ p: 2, mb: 3, bgcolor: "#fffbeb", borderRadius: 2 }}>
            <Typography variant="subtitle2" fontWeight={700} mb={1.5}>
              Các lựa chọn:
            </Typography>
            <Stack spacing={0.5}>
              {q.matchingOptions.map((opt, idx) => (
                <Typography key={idx} variant="body2">
                  {opt}
                </Typography>
              ))}
            </Stack>
          </Paper>
        )}

        {/* Question Text */}
        {(sub?.questionText || q?.questionText) && (
          <Typography variant="body1" fontWeight={600} mb={3}>
            <Box component="span" sx={{ color: theme.colors.primary, mr: 1 }}>
              {currentQuestionId}.
            </Box>
            {sub?.questionText || q?.questionText}
          </Typography>
        )}

        {/* Render based on question type */}
        {renderAnswerInput(questionType, q, sub)}
      </Box>
    );
  };

  const renderAnswerInput = (
    type: QuestionType,
    q: Question | null,
    sub: Question["subQuestions"][0] | null
  ) => {
    const options = sub?.options || q?.options;

    switch (type) {
      case "multiple-choice":
        return (
          <RadioGroup
            value={answers[currentQuestionId] || ""}
            onChange={(e) => handleAnswer(currentQuestionId, e.target.value)}
          >
            <Stack spacing={1.5}>
              {options?.map((option) => (
                <Paper
                  key={option.label}
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    border: "2px solid",
                    borderColor: answers[currentQuestionId] === option.label ? theme.colors.primary : "#e5e7eb",
                    bgcolor: answers[currentQuestionId] === option.label ? "#f0fdf4" : "white",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    "&:hover": { borderColor: theme.colors.primaryLight },
                  }}
                  onClick={() => handleAnswer(currentQuestionId, option.label)}
                >
                  <FormControlLabel
                    value={option.label}
                    control={
                      <Radio sx={{ color: "#d1d5db", "&.Mui-checked": { color: theme.colors.primary } }} />
                    }
                    label={
                      <Typography variant="body2">
                        <strong>{option.label}.</strong> {option.text}
                      </Typography>
                    }
                    sx={{ m: 0 }}
                  />
                </Paper>
              ))}
            </Stack>
          </RadioGroup>
        );

      case "true-false-notgiven":
      case "yes-no-notgiven":
        const tfOptions = type === "true-false-notgiven"
          ? ["TRUE", "FALSE", "NOT GIVEN"]
          : ["YES", "NO", "NOT GIVEN"];
        return (
          <RadioGroup
            value={answers[currentQuestionId] || ""}
            onChange={(e) => handleAnswer(currentQuestionId, e.target.value)}
          >
            <Stack direction="row" spacing={2}>
              {tfOptions.map((opt) => (
                <Paper
                  key={opt}
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    border: "2px solid",
                    borderColor: answers[currentQuestionId] === opt ? theme.colors.primary : "#e5e7eb",
                    bgcolor: answers[currentQuestionId] === opt ? "#f0fdf4" : "white",
                    cursor: "pointer",
                    flex: 1,
                    textAlign: "center",
                    "&:hover": { borderColor: theme.colors.primaryLight },
                  }}
                  onClick={() => handleAnswer(currentQuestionId, opt)}
                >
                  <FormControlLabel
                    value={opt}
                    control={
                      <Radio sx={{ color: "#d1d5db", "&.Mui-checked": { color: theme.colors.primary } }} />
                    }
                    label={<Typography variant="body2" fontWeight={600}>{opt}</Typography>}
                    sx={{ m: 0 }}
                  />
                </Paper>
              ))}
            </Stack>
          </RadioGroup>
        );

      case "matching-headings":
      case "matching-features":
      case "matching-information":
        return (
          <TextField
            fullWidth
            size="small"
            placeholder="Nhập đáp án (vd: A, B, C...)"
            value={answers[currentQuestionId] || ""}
            onChange={(e) => handleAnswer(currentQuestionId, e.target.value.toUpperCase())}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                "&.Mui-focused fieldset": { borderColor: theme.colors.primary },
              },
            }}
            inputProps={{ maxLength: 5, style: { textTransform: "uppercase" } }}
          />
        );

      case "form-completion":
      case "note-completion":
      case "sentence-completion":
      case "summary-completion":
      case "table-completion":
      case "short-answer":
        const maxWords = q?.maxWords || 3;
        return (
          <TextField
            fullWidth
            size="small"
            placeholder={`Nhập đáp án (tối đa ${maxWords} từ)`}
            value={answers[currentQuestionId] || ""}
            onChange={(e) => handleAnswer(currentQuestionId, e.target.value)}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                "&.Mui-focused fieldset": { borderColor: theme.colors.primary },
              },
            }}
          />
        );

      default:
        return null;
    }
  };

  return (
    <Box sx={{ bgcolor: "#f8fafc", minHeight: "100vh" }}>
      {/* Header */}
      <Box
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          bgcolor: "white",
          borderBottom: "1px solid #e5e7eb",
          py: 2,
          px: 3,
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack direction="row" spacing={2} alignItems="center">
            <IconButton onClick={() => setShowExitDialog(true)}>
              <ArrowLeft size={20} />
            </IconButton>
            <Box>
              <Typography variant="h6" fontWeight={700}>
                IELTS Full Test
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <Chip
                  label={isListeningSection ? "Listening" : "Reading"}
                  size="small"
                  sx={{
                    bgcolor: isListeningSection ? "#dbeafe" : "#fef3c7",
                    color: isListeningSection ? "#1d4ed8" : "#92400e",
                    fontWeight: 600,
                  }}
                />
                <Typography variant="caption" color="text.secondary">
                  Câu {currentQuestionId}/80
                </Typography>
              </Stack>
            </Box>
          </Stack>

          <Stack direction="row" spacing={3} alignItems="center">
            <ExamTimer initialMinutes={isListeningSection ? 30 : 60} onTimeUp={handleTimeUp} />
            <Box sx={{ width: 150 }}>
              <Typography variant="caption" color="text.secondary">
                Tiến độ: {answeredCount}/{totalQuestions}
              </Typography>
              <LinearProgress
                variant="determinate"
                value={progress}
                sx={{
                  height: 6,
                  borderRadius: 3,
                  bgcolor: "#e5e7eb",
                  "& .MuiLinearProgress-bar": { bgcolor: theme.colors.primary },
                }}
              />
            </Box>
            <Button
              variant="contained"
              startIcon={<Send size={18} />}
              onClick={() => setShowSubmitDialog(true)}
              sx={{
                background: theme.gradients.primary,
                "&:hover": { background: theme.gradients.primaryDark },
              }}
            >
              Nộp bài
            </Button>
          </Stack>
        </Stack>
      </Box>

      {/* Main Content */}
      <Box sx={{ p: 3 }}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 9 }}>
            <Paper sx={{ p: 3, borderRadius: 2 }}>
              {/* Question Header */}
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 2,
                      background: theme.gradients.primary,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      fontWeight: 700,
                    }}
                  >
                    {currentQuestionId}
                  </Box>
                  <Typography variant="h6" fontWeight={700}>
                    Câu {currentQuestionId}
                  </Typography>
                </Stack>

                {isReadingSection && (
                  <Tooltip title={flaggedQuestions.has(currentQuestionId) ? "Bỏ đánh dấu" : "Đánh dấu"}>
                    <IconButton
                      onClick={() => handleFlag(currentQuestionId)}
                      sx={{ color: flaggedQuestions.has(currentQuestionId) ? "#d97706" : "grey.400" }}
                    >
                      <Flag size={20} fill={flaggedQuestions.has(currentQuestionId) ? "#d97706" : "transparent"} />
                    </IconButton>
                  </Tooltip>
                )}
              </Stack>

              {/* Listening Notice */}
              {isListeningSection && (
                <Paper sx={{ p: 2, mb: 3, bgcolor: "#fef3c7", borderRadius: 2 }}>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Headphones size={20} color="#d97706" />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" fontWeight={600} color="#92400e">
                        Phần Listening
                      </Typography>
                      <Typography variant="caption" color="#92400e">
                        Audio sẽ tự động phát. Bạn không thể quay lại câu trước.
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>
              )}

              {/* Audio Player */}
              {isListeningSection && (
                <Paper
                  sx={{
                    p: 2,
                    mb: 3,
                    borderRadius: 2,
                    bgcolor: audioEnded ? "#fef3c7" : "#f0f9ff",
                    border: `1px solid ${audioEnded ? "#fde68a" : "#bae6fd"}`,
                  }}
                >
                  <Stack spacing={2}>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: "50%",
                          bgcolor: isAudioPlaying ? "#0ea5e9" : audioEnded ? "#d97706" : "#94a3b8",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "white",
                          animation: isAudioPlaying ? "pulse 1.5s infinite" : "none",
                          "@keyframes pulse": {
                            "0%": { boxShadow: "0 0 0 0 rgba(14, 165, 233, 0.4)" },
                            "70%": { boxShadow: "0 0 0 10px rgba(14, 165, 233, 0)" },
                            "100%": { boxShadow: "0 0 0 0 rgba(14, 165, 233, 0)" },
                          },
                        }}
                      >
                        {isAudioPlaying ? <Volume2 size={20} /> : <Play size={20} />}
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <LinearProgress
                          variant="determinate"
                          value={(audioProgress / audioDuration) * 100}
                          sx={{
                            height: 6,
                            borderRadius: 3,
                            bgcolor: audioEnded ? "#fde68a" : "#e0f2fe",
                            "& .MuiLinearProgress-bar": {
                              bgcolor: audioEnded ? "#d97706" : "#0ea5e9",
                              transition: audioProgress === 0 ? "none" : "transform 0.5s linear",
                            },
                          }}
                        />
                      </Box>
                      <Typography variant="caption" color="text.secondary" sx={{ minWidth: 70 }}>
                        {Math.floor(audioProgress / 60)}:{(audioProgress % 60).toString().padStart(2, "0")} /{" "}
                        {Math.floor(audioDuration / 60)}:{(audioDuration % 60).toString().padStart(2, "0")}
                      </Typography>
                    </Stack>

                    {isAudioPlaying && (
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Headphones size={16} color="#0ea5e9" />
                        <Typography variant="caption" color="#0284c7" fontWeight={600}>
                          Đang phát audio... Hãy lắng nghe cẩn thận
                        </Typography>
                      </Stack>
                    )}

                    {audioEnded && autoAdvanceCountdown !== null && (
                      <Paper sx={{ p: 1.5, bgcolor: "#fffbeb", borderRadius: 2, border: "1px solid #fef3c7" }}>
                        <Stack spacing={0.5} alignItems="center">
                          <Stack direction="row" spacing={1.5} alignItems="center">
                            <Clock size={18} color="#d97706" />
                            <Typography variant="body2" fontWeight={700} color="#92400e">
                              Tự động chuyển câu sau {autoAdvanceCountdown} giây
                            </Typography>
                          </Stack>
                        </Stack>
                      </Paper>
                    )}
                  </Stack>
                </Paper>
              )}

              {/* Question Content */}
              {renderQuestion()}

              {/* Navigation */}
              <Box sx={{ mt: 4, pt: 3, borderTop: "1px solid #e5e7eb" }}>
                <Stack direction="row" justifyContent="space-between">
                  {isReadingSection && (
                    <Button
                      variant="outlined"
                      startIcon={<ChevronLeft size={18} />}
                      disabled={currentQuestionId === 41}
                      onClick={() => handleNavigate("prev")}
                      sx={{
                        borderColor: "#e5e7eb",
                        color: "grey.700",
                        "&:hover": { borderColor: theme.colors.primary, color: theme.colors.primary },
                      }}
                    >
                      Câu trước
                    </Button>
                  )}

                  <Button
                    variant="contained"
                    endIcon={<ChevronRight size={18} />}
                    disabled={currentQuestionIndex === allQuestionIds.length - 1 || (isListeningSection && isAudioPlaying)}
                    onClick={() => handleNavigate("next")}
                    sx={{
                      ml: "auto",
                      background: theme.gradients.primary,
                      "&:hover": { background: theme.gradients.primaryDark },
                    }}
                  >
                    {isListeningSection && autoAdvanceCountdown !== null
                      ? `Câu tiếp theo (${autoAdvanceCountdown}s)`
                      : "Câu tiếp theo"}
                  </Button>
                </Stack>
              </Box>
            </Paper>
          </Grid>

          {/* Sidebar */}
          <Grid size={{ xs: 12, md: 3 }} sx={{ display: { xs: "none", md: "block" } }}>
            <Box sx={{ position: "sticky", top: 120 }}>
              <QuestionNavigator
                sections={sections}
                answers={answers}
                flaggedQuestions={flaggedQuestions}
                currentQuestion={currentQuestionId}
                onQuestionClick={handleQuestionClick}
                isListeningSection={isListeningSection}
                listeningProgress={listeningProgress}
              />
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Submit Dialog */}
      <Dialog open={showSubmitDialog} onClose={() => setShowSubmitDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Xác nhận nộp bài</DialogTitle>
        <DialogContent>
          <Stack spacing={2}>
            <Paper sx={{ p: 2, bgcolor: "#f8fafc", borderRadius: 2 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="body2">Số câu đã trả lời:</Typography>
                <Typography variant="subtitle1" fontWeight={700} color={theme.colors.primary}>
                  {answeredCount}/{totalQuestions}
                </Typography>
              </Stack>
            </Paper>

            {answeredCount < totalQuestions && (
              <Paper sx={{ p: 2, bgcolor: "#fef3c7", borderRadius: 2 }}>
                <Stack direction="row" spacing={1} alignItems="flex-start">
                  <AlertTriangle size={20} color="#d97706" />
                  <Box>
                    <Typography variant="body2" fontWeight={600} color="#92400e">
                      Cảnh báo
                    </Typography>
                    <Typography variant="caption" color="#92400e">
                      Bạn còn {totalQuestions - answeredCount} câu chưa trả lời.
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setShowSubmitDialog(false)} sx={{ color: "grey.600" }}>
            Quay lại
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={isSubmitting}
            sx={{ background: theme.gradients.primary, "&:hover": { background: theme.gradients.primaryDark } }}
          >
            {isSubmitting ? "Đang nộp bài..." : "Xác nhận nộp bài"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Exit Dialog */}
      <Dialog open={showExitDialog} onClose={() => setShowExitDialog(false)}>
        <DialogTitle sx={{ fontWeight: 700 }}>Thoát bài thi?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Tiến độ của bạn sẽ không được lưu. Bạn có chắc chắn muốn thoát?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setShowExitDialog(false)} sx={{ color: "grey.600" }}>
            Tiếp tục làm bài
          </Button>
          <Button
            variant="outlined"
            color="error"
            onClick={() => router.push(`/user/exam/ielts/fulltest/${testId}`)}
          >
            Thoát bài thi
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
