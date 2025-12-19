"use client";

import React, { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Box,
  Paper,
  Typography,
  Button,
  Stack,
  Grid,
  Chip,
  Tabs,
  Tab,
  Collapse,
  IconButton,
  TextField,
  LinearProgress,
} from "@mui/material";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  Headphones,
  BookOpen,
  Pencil,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  Play,
  RotateCcw,
  MessageSquare,
  FileText,
  Star,
  Target,
  AlertCircle,
} from "lucide-react";
import { examTheme } from "@/components/exam";

const theme = examTheme;

// Mock data - Chi tiết đáp án IELTS
const mockIeltsReviewData = {
  id: 1,
  testTitle: "IELTS Academic Test 1",
  overallBand: 7.0,
  sections: {
    listening: {
      band: 7.5,
      correct: 34,
      total: 40,
      sections: [
        {
          section: 1,
          name: "Section 1 - Conversation",
          description: "A conversation between two people in an everyday social context",
          audioUrl: "/audio/ielts/listening/section1.mp3",
          questions: [
            {
              id: 1,
              type: "form-completion",
              instruction: "Complete the form below. Write NO MORE THAN TWO WORDS AND/OR A NUMBER for each answer.",
              context: "Booking Form - Holiday Apartment",
              items: [
                { id: 1, label: "Name", correctAnswer: "Sarah Mitchell", userAnswer: "Sarah Mitchell", isCorrect: true },
                { id: 2, label: "Phone number", correctAnswer: "07845 293847", userAnswer: "07845 293847", isCorrect: true },
                { id: 3, label: "Arrival date", correctAnswer: "15 March", userAnswer: "15th March", isCorrect: true, note: "Cả hai cách viết đều được chấp nhận" },
                { id: 4, label: "Number of nights", correctAnswer: "7", userAnswer: "seven", isCorrect: true },
                { id: 5, label: "Special request", correctAnswer: "sea view", userAnswer: "ocean view", isCorrect: false },
              ],
              explanation: "Câu 5: Người nói yêu cầu 'sea view' (nhìn ra biển), không phải 'ocean view'. Trong IELTS, cần viết chính xác từ nghe được.",
              tips: "Với dạng Form Completion, hãy đọc trước các nhãn (labels) để dự đoán loại thông tin cần điền. Chú ý giới hạn số từ.",
            },
            {
              id: 6,
              type: "multiple-choice",
              questionText: "What is included in the apartment rental?",
              options: [
                { label: "A", text: "Breakfast" },
                { label: "B", text: "Airport transfer" },
                { label: "C", text: "Parking space" },
              ],
              correctAnswer: "C",
              userAnswer: "C",
              isCorrect: true,
              explanation: "Người nhân viên nói 'The apartment comes with a free parking space' - căn hộ đi kèm chỗ đậu xe miễn phí.",
            },
          ],
        },
        {
          section: 2,
          name: "Section 2 - Monologue",
          description: "A monologue in an everyday social context, e.g., a speech about local facilities",
          audioUrl: "/audio/ielts/listening/section2.mp3",
          questions: [
            {
              id: 11,
              type: "matching",
              instruction: "What does the speaker say about each facility?",
              context: "Community Centre Facilities",
              matchingOptions: [
                { label: "A", text: "Recently renovated" },
                { label: "B", text: "Open 24 hours" },
                { label: "C", text: "Members only" },
                { label: "D", text: "Free for children" },
              ],
              items: [
                { id: 11, label: "Swimming pool", correctAnswer: "A", userAnswer: "A", isCorrect: true },
                { id: 12, label: "Gym", correctAnswer: "B", userAnswer: "C", isCorrect: false },
                { id: 13, label: "Tennis courts", correctAnswer: "D", userAnswer: "D", isCorrect: true },
              ],
              explanation: "Câu 12: Speaker nói 'The gym is available 24/7' (phòng gym mở 24/7), đáp án là B không phải C.",
              tips: "Với dạng Matching, đọc kỹ tất cả các options trước. Một option có thể không được dùng hoặc dùng nhiều lần.",
            },
          ],
        },
        {
          section: 3,
          name: "Section 3 - Discussion",
          description: "A conversation between up to four people in an educational context",
          audioUrl: "/audio/ielts/listening/section3.mp3",
          questions: [
            {
              id: 21,
              type: "multiple-choice",
              questionText: "What is the main topic of the students' discussion?",
              options: [
                { label: "A", text: "Their research methodology" },
                { label: "B", text: "The presentation structure" },
                { label: "C", text: "The deadline extension" },
              ],
              correctAnswer: "B",
              userAnswer: "B",
              isCorrect: true,
              explanation: "Hai sinh viên thảo luận về cách tổ chức bài thuyết trình (presentation structure).",
            },
            {
              id: 22,
              type: "sentence-completion",
              instruction: "Complete the sentences below. Write NO MORE THAN THREE WORDS for each answer.",
              items: [
                {
                  id: 22,
                  sentence: "The students need to include more _______ in their literature review.",
                  correctAnswer: "recent sources",
                  userAnswer: "recent sources",
                  isCorrect: true,
                },
                {
                  id: 23,
                  sentence: "The professor suggests using _______ to organize the data.",
                  correctAnswer: "a flowchart",
                  userAnswer: "flowchart",
                  isCorrect: true,
                  note: "Có hoặc không có 'a' đều được chấp nhận",
                },
              ],
              explanation: "Chú ý đếm số từ: 'a flowchart' = 2 từ, 'recent sources' = 2 từ.",
            },
          ],
        },
        {
          section: 4,
          name: "Section 4 - Lecture",
          description: "A monologue on an academic subject, e.g., a university lecture",
          audioUrl: "/audio/ielts/listening/section4.mp3",
          questions: [
            {
              id: 31,
              type: "note-completion",
              instruction: "Complete the notes below. Write ONE WORD ONLY for each answer.",
              title: "The History of Urban Planning",
              notes: [
                {
                  id: 31,
                  text: "Ancient cities were designed around a central _______",
                  correctAnswer: "marketplace",
                  userAnswer: "market",
                  isCorrect: false,
                },
                {
                  id: 32,
                  text: "The grid system was first used in _______ cities",
                  correctAnswer: "Greek",
                  userAnswer: "Greek",
                  isCorrect: true,
                },
                {
                  id: 33,
                  text: "Modern planning focuses on _______ development",
                  correctAnswer: "sustainable",
                  userAnswer: "sustainable",
                  isCorrect: true,
                },
              ],
              explanation: "Câu 31: Từ chính xác là 'marketplace' (1 từ), không phải 'market'. Trong IELTS, cần viết đúng từ nghe được.",
              tips: "Section 4 thường khó nhất. Đọc kỹ notes trước và dự đoán loại từ cần điền (noun/verb/adjective).",
            },
          ],
        },
      ],
    },
    reading: {
      band: 7.0,
      correct: 32,
      total: 40,
      passages: [
        {
          passage: 1,
          title: "The Rise of Vertical Farming",
          text: `Vertical farming is an innovative approach to producing food in vertically stacked layers, typically in controlled environments. This method of agriculture uses significantly less water than traditional farming – up to 95% less in some cases – and eliminates the need for pesticides.

The concept was first proposed by Professor Dickson Despommier at Columbia University in 1999. He argued that vertical farms could provide fresh produce year-round, regardless of weather conditions, while using a fraction of the land required by conventional agriculture.

Modern vertical farms utilize advanced technologies including LED lighting, hydroponics, and climate control systems. These farms can be established in urban areas, reducing transportation costs and carbon emissions associated with food distribution.

However, critics point out several challenges. The initial investment required is substantial, often running into millions of dollars. Energy costs for lighting and climate control can be prohibitive. Additionally, only certain crops – mainly leafy greens and herbs – are currently economically viable for vertical farming.

Despite these challenges, the industry is growing rapidly. The global vertical farming market was valued at $3.1 billion in 2021 and is projected to reach $20 billion by 2028.`,
          questions: [
            {
              id: 1,
              type: "true-false-ng",
              instruction: "Do the following statements agree with the information given in the passage? Write TRUE, FALSE, or NOT GIVEN.",
              items: [
                {
                  id: 1,
                  statement: "Vertical farming uses more water than traditional agriculture.",
                  correctAnswer: "FALSE",
                  userAnswer: "FALSE",
                  isCorrect: true,
                  explanation: "Đoạn 1 nói 'uses significantly less water than traditional farming – up to 95% less'.",
                },
                {
                  id: 2,
                  statement: "Professor Despommier invented vertical farming in 1999.",
                  correctAnswer: "NOT GIVEN",
                  userAnswer: "TRUE",
                  isCorrect: false,
                  explanation: "Đoạn 2 nói ông 'proposed' (đề xuất) concept, không nói ông 'invented' (phát minh). Phân biệt rõ propose ≠ invent.",
                },
                {
                  id: 3,
                  statement: "LED lighting is one of the technologies used in vertical farms.",
                  correctAnswer: "TRUE",
                  userAnswer: "TRUE",
                  isCorrect: true,
                  explanation: "Đoạn 3: 'utilize advanced technologies including LED lighting'.",
                },
              ],
              tips: "TRUE/FALSE/NOT GIVEN: TRUE = thông tin đúng với passage. FALSE = thông tin trái ngược. NOT GIVEN = không có thông tin để xác nhận hoặc phủ nhận.",
            },
            {
              id: 4,
              type: "matching-headings",
              instruction: "Choose the correct heading for each paragraph from the list below.",
              headings: [
                { label: "i", text: "The origin of the concept" },
                { label: "ii", text: "Current limitations and concerns" },
                { label: "iii", text: "Definition and benefits" },
                { label: "iv", text: "Technology and location advantages" },
                { label: "v", text: "Future market predictions" },
              ],
              items: [
                { id: 4, paragraph: "Paragraph 1", correctAnswer: "iii", userAnswer: "iii", isCorrect: true },
                { id: 5, paragraph: "Paragraph 2", correctAnswer: "i", userAnswer: "i", isCorrect: true },
                { id: 6, paragraph: "Paragraph 4", correctAnswer: "ii", userAnswer: "iv", isCorrect: false },
              ],
              explanation: "Câu 6: Paragraph 4 nói về 'challenges' (thách thức) như chi phí đầu tư cao, chi phí năng lượng - đây là limitations, không phải advantages.",
            },
          ],
        },
        {
          passage: 2,
          title: "Sleep and Memory Consolidation",
          text: `Research over the past two decades has established a clear link between sleep and memory. During sleep, the brain processes and consolidates information acquired during waking hours, transforming short-term memories into long-term storage.

Studies using brain imaging have revealed that the hippocampus, a region crucial for memory formation, shows increased activity during certain sleep stages. This activity appears to involve the replay of experiences from the previous day, strengthening neural connections associated with those memories.

The importance of different sleep stages varies depending on the type of memory being consolidated. Declarative memory – the recall of facts and events – benefits primarily from slow-wave sleep, which occurs mainly in the first half of the night. Procedural memory – skills and habits – appears to be more dependent on REM sleep, which predominates in the later hours.

Sleep deprivation has been shown to significantly impair memory consolidation. In one study, participants who were allowed to sleep after learning a task showed 20% better recall than those who remained awake. The effects were particularly pronounced for complex or emotionally significant information.`,
          questions: [
            {
              id: 14,
              type: "summary-completion",
              instruction: "Complete the summary below. Choose NO MORE THAN TWO WORDS from the passage for each answer.",
              summary: "During sleep, the brain converts (14)_______ memories into long-term memories. The (15)_______ shows increased activity during sleep, replaying daily experiences. Different types of memory require different sleep stages: factual memory needs (16)_______ sleep, while skill-based memory requires REM sleep.",
              items: [
                { id: 14, correctAnswer: "short-term", userAnswer: "short-term", isCorrect: true },
                { id: 15, correctAnswer: "hippocampus", userAnswer: "hippocampus", isCorrect: true },
                { id: 16, correctAnswer: "slow-wave", userAnswer: "deep", isCorrect: false },
              ],
              explanation: "Câu 16: Passage dùng từ 'slow-wave sleep', không phải 'deep sleep'. Trong IELTS Reading, phải dùng chính xác từ trong bài.",
              tips: "Summary Completion: Từ điền phải có trong passage. Đọc kỹ giới hạn số từ. Không thay đổi dạng từ (ví dụ: sleep → sleeping).",
            },
          ],
        },
      ],
    },
    writing: {
      band: 6.5,
      tasks: [
        {
          task: 1,
          type: "Graph Description",
          band: 6.5,
          prompt: "The chart below shows the percentage of households in owned and rented accommodation in England and Wales between 1918 and 2011. Summarize the information by selecting and reporting the main features, and make comparisons where relevant.",
          imageUrl: "/images/ielts/writing/task1-chart.png",
          userResponse: `The bar chart illustrates the proportion of households living in owned and rented properties in England and Wales from 1918 to 2011.

Overall, there was a significant shift from rented to owned accommodation over the period. In 1918, the majority of households rented their homes, but by 2011, home ownership had become dominant.

In 1918, approximately 77% of households lived in rented accommodation, while only 23% owned their homes. This pattern began to change after World War II, with home ownership rising steadily. By 1971, the two categories were almost equal, with around 50% each.

The trend continued in the following decades. Home ownership peaked at about 69% in 2001, before declining slightly to 64% by 2011. Correspondingly, rented accommodation fell to its lowest point of 31% in 2001, then rose marginally to 36% in 2011.`,
          feedback: {
            taskAchievement: {
              band: 7,
              comments: "Bài viết bao quát đầy đủ các điểm chính và xu hướng tổng quát. Có so sánh các giai đoạn. Tuy nhiên, có thể thêm chi tiết về tốc độ thay đổi.",
              strengths: ["Có overview rõ ràng", "Đưa ra số liệu cụ thể", "So sánh hai loại hình nhà ở"],
              improvements: ["Phân tích thêm giai đoạn 1939-1953", "Mô tả tốc độ thay đổi cụ thể hơn"],
            },
            coherenceCohesion: {
              band: 6,
              comments: "Cấu trúc bài hợp lý với giới thiệu, tổng quan và phân tích chi tiết. Có sử dụng linking words nhưng còn hạn chế.",
              strengths: ["Paragraph structure tốt", "Logical sequencing"],
              improvements: ["Sử dụng đa dạng linking words hơn", "Cần thêm các cụm từ so sánh (whereas, while, in contrast)"],
            },
            lexicalResource: {
              band: 6,
              comments: "Vocabulary phù hợp với chủ đề. Có sử dụng một số collocations tốt nhưng còn lặp từ.",
              strengths: ["'significant shift'", "'steadily rising'", "'peaked at'"],
              improvements: ["Tránh lặp 'households'", "Dùng thêm từ đồng nghĩa: accommodation → housing, property"],
            },
            grammaticalRange: {
              band: 7,
              comments: "Sử dụng đa dạng cấu trúc câu với độ chính xác cao. Có sử dụng passive voice và complex sentences.",
              strengths: ["Variety of sentence structures", "Correct use of past tenses", "Good use of passive voice"],
              improvements: ["Thử dùng thêm relative clauses", "Có thể dùng comparatives phức tạp hơn"],
            },
          },
          sampleAnswer: `The bar chart compares the proportions of owned and rented housing in England and Wales over a 93-year period from 1918 to 2011.

Overall, there was a dramatic reversal in housing tenure patterns, with rented accommodation declining significantly while home ownership rose to become the predominant form of housing.

In 1918, rented housing accounted for approximately three-quarters of all households (77%), whereas only 23% of homes were owner-occupied. This disparity began to narrow following World War II, with owned accommodation rising steadily from 26% in 1939 to reach parity with rentals at around 50% by 1971.

The upward trend in home ownership continued into the late 20th century, reaching its peak of 69% in 2001. Conversely, rented accommodation fell to just 31% in the same year. However, the final decade saw a slight reversal, with ownership decreasing to 64% and rentals recovering to 36% by 2011.`,
        },
        {
          task: 2,
          type: "Essay - Opinion",
          band: 6.5,
          prompt: "Some people believe that children should be taught to be competitive, while others think they should learn to cooperate. Discuss both views and give your own opinion.",
          userResponse: `In today's society, there is a debate about whether children should be taught to be competitive or to cooperate with others. Both approaches have their merits, and I will discuss both views before giving my opinion.

On one hand, competition can motivate children to work harder and achieve their potential. When children compete, they learn to set goals, work independently, and develop resilience in the face of failure. These are important life skills that will help them succeed in their careers. For example, in sports and academic competitions, children learn the value of hard work and dedication.

On the other hand, cooperation teaches children valuable social skills. Working together with others helps children develop empathy, communication skills, and the ability to compromise. In the modern workplace, teamwork is essential, and children who learn to cooperate will be better prepared for collaborative environments. Moreover, cooperation creates a more supportive learning environment where all children can thrive.

In my opinion, both competition and cooperation are important, but cooperation should be emphasized more. While competition can drive individual achievement, excessive focus on winning can lead to stress, anxiety, and poor relationships with peers. A balanced approach that teaches children to work together while also recognizing individual accomplishments would be ideal.

In conclusion, education should incorporate both competitive and cooperative elements, with greater emphasis on collaboration to prepare children for a world that increasingly values teamwork and social skills.`,
          feedback: {
            taskResponse: {
              band: 7,
              comments: "Địa chỉ đầy đủ cả hai quan điểm và đưa ra ý kiến rõ ràng. Các ý được phát triển hợp lý với examples phù hợp.",
              strengths: ["Clear position throughout", "Both views addressed equally", "Relevant examples provided"],
              improvements: ["Có thể phát triển examples chi tiết hơn", "Conclusion có thể mạnh mẽ hơn"],
            },
            coherenceCohesion: {
              band: 6,
              comments: "Cấu trúc essay rõ ràng với introduction, body paragraphs và conclusion. Có sử dụng linking words nhưng còn cơ bản.",
              strengths: ["Clear paragraph structure", "Logical progression of ideas"],
              improvements: ["Đa dạng linking devices hơn", "Tránh bắt đầu nhiều câu bằng 'When', 'In'", "Cần cohesive devices tinh tế hơn"],
            },
            lexicalResource: {
              band: 6,
              comments: "Vocabulary phù hợp nhưng còn hạn chế về range. Một số collocation tốt nhưng chưa đa dạng.",
              strengths: ["'develop resilience'", "'collaborative environments'", "'individual accomplishments'"],
              improvements: ["Tránh lặp 'children' quá nhiều", "Dùng thêm academic vocabulary", "Thử dùng idiomatic expressions"],
            },
            grammaticalRange: {
              band: 7,
              comments: "Sử dụng đa dạng cấu trúc câu với ít lỗi. Complex sentences được dùng hiệu quả.",
              strengths: ["Good variety of complex structures", "Accurate use of conditionals", "Effective use of passive voice"],
              improvements: ["Thử dùng thêm inversion", "Có thể dùng more sophisticated structures"],
            },
          },
          sampleAnswer: `The question of whether to prioritize competition or cooperation in children's education has sparked considerable debate among educators and parents alike. While both approaches offer distinct benefits, I believe a balanced methodology that slightly favors collaborative learning would best serve children's development.

Proponents of competitive education argue that it prepares children for real-world challenges. Competition, they contend, instills drive, resilience, and a strong work ethic. When students compete for grades or awards, they often push themselves beyond their perceived limitations. Furthermore, competitive environments mirror the professional world, where individuals must distinguish themselves to advance their careers.

Conversely, advocates of cooperative learning emphasize its social and emotional benefits. Collaboration teaches children to value diverse perspectives, negotiate differences, and achieve collective goals. In an increasingly interconnected world, the ability to work effectively in teams has become paramount. Research also suggests that cooperative learning environments reduce anxiety and foster intrinsic motivation, leading to deeper understanding and retention of knowledge.

In my view, while competition has its place, overemphasis on winning can be counterproductive. Excessive competition may breed unhealthy stress, undermine self-esteem in those who consistently lose, and damage peer relationships. A more nuanced approach would integrate competitive elements within a predominantly cooperative framework, allowing children to experience both the thrill of individual achievement and the satisfaction of collective success.

In conclusion, education systems should strive for balance, with a slight emphasis on cooperation. This approach would equip children with both the competitive spirit to excel individually and the collaborative skills essential for success in our interconnected society.`,
        },
      ],
    },
  },
};

// Writing Criteria Component
const WritingCriteriaCard = ({
  title,
  band,
  comments,
  strengths,
  improvements,
}: {
  title: string;
  band: number;
  comments: string;
  strengths: string[];
  improvements: string[];
}) => (
  <Paper elevation={0} sx={{ p: 2.5, borderRadius: 2, border: "1px solid #e5e7eb" }}>
    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
      <Typography variant="subtitle1" fontWeight={700}>
        {title}
      </Typography>
      <Chip
        label={`Band ${band}`}
        size="small"
        sx={{
          fontWeight: 700,
          bgcolor: band >= 7 ? "#d1fae5" : band >= 6 ? "#fef3c7" : "#fee2e2",
          color: band >= 7 ? theme.colors.primaryDark : band >= 6 ? "#92400e" : "#dc2626",
        }}
      />
    </Stack>
    <Typography variant="body2" color="text.secondary" mb={2}>
      {comments}
    </Typography>
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, sm: 6 }}>
        <Box sx={{ p: 1.5, bgcolor: "#f0fdf4", borderRadius: 2 }}>
          <Stack direction="row" spacing={1} alignItems="center" mb={1}>
            <CheckCircle size={14} color={theme.colors.primary} />
            <Typography variant="caption" fontWeight={700} color={theme.colors.primaryDark}>
              Điểm mạnh
            </Typography>
          </Stack>
          <Stack spacing={0.5}>
            {strengths.map((s, i) => (
              <Typography key={i} variant="caption" color="grey.700">
                • {s}
              </Typography>
            ))}
          </Stack>
        </Box>
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <Box sx={{ p: 1.5, bgcolor: "#fffbeb", borderRadius: 2 }}>
          <Stack direction="row" spacing={1} alignItems="center" mb={1}>
            <AlertCircle size={14} color="#d97706" />
            <Typography variant="caption" fontWeight={700} color="#92400e">
              Cần cải thiện
            </Typography>
          </Stack>
          <Stack spacing={0.5}>
            {improvements.map((s, i) => (
              <Typography key={i} variant="caption" color="grey.700">
                • {s}
              </Typography>
            ))}
          </Stack>
        </Box>
      </Grid>
    </Grid>
  </Paper>
);

export default function IeltsReviewPage() {
  const router = useRouter();
  const params = useParams();
  const [activeSection, setActiveSection] = useState<"listening" | "reading" | "writing">("listening");
  const [activeSubSection, setActiveSubSection] = useState(0);
  const [expandedQuestions, setExpandedQuestions] = useState<Set<number>>(new Set());
  const [showSampleAnswer, setShowSampleAnswer] = useState<Record<number, boolean>>({});

  const reviewData = mockIeltsReviewData;

  const toggleExplanation = (id: number) => {
    const newExpanded = new Set(expandedQuestions);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedQuestions(newExpanded);
  };

  return (
    <Box sx={{ bgcolor: "#f8fafc", minHeight: "100vh" }}>
      {/* Header */}
      <Box
        sx={{
          background: theme.gradients.hero,
          py: 3,
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <Box sx={{ maxWidth: 1400, mx: "auto", px: { xs: 2, md: 4 } }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Stack direction="row" spacing={2} alignItems="center">
              <IconButton
                onClick={() => router.push(`/user/exam/ielts/fulltest/${params.id}/result`)}
                sx={{ color: "white" }}
              >
                <ArrowLeft size={24} />
              </IconButton>
              <Box>
                <Typography variant="h6" fontWeight={700} color="white">
                  {reviewData.testTitle} - Xem đáp án chi tiết
                </Typography>
                <Typography variant="body2" color="rgba(255,255,255,0.8)">
                  Overall Band: {reviewData.overallBand}
                </Typography>
              </Box>
            </Stack>

            <Button
              variant="contained"
              startIcon={<RotateCcw size={18} />}
              onClick={() => router.push(`/user/exam/ielts/fulltest/${params.id}`)}
              sx={{
                bgcolor: "white",
                color: theme.colors.primaryDark,
                fontWeight: 700,
                "&:hover": { bgcolor: "#f0fdf4" },
              }}
            >
              Làm lại
            </Button>
          </Stack>
        </Box>
      </Box>

      {/* Section Tabs */}
      <Box sx={{ bgcolor: "white", borderBottom: "1px solid #e5e7eb" }}>
        <Box sx={{ maxWidth: 1400, mx: "auto", px: { xs: 2, md: 4 } }}>
          <Tabs
            value={activeSection}
            onChange={(_, v) => {
              setActiveSection(v);
              setActiveSubSection(0);
            }}
            sx={{
              "& .MuiTabs-indicator": {
                height: 3,
                borderRadius: 2,
                bgcolor: theme.colors.primary,
              },
              "& .MuiTab-root": {
                fontWeight: 600,
                textTransform: "none",
                fontSize: "1rem",
                "&.Mui-selected": { color: theme.colors.primary },
              },
            }}
          >
            <Tab
              value="listening"
              icon={<Headphones size={18} />}
              iconPosition="start"
              label={`Listening (Band ${reviewData.sections.listening.band})`}
            />
            <Tab
              value="reading"
              icon={<BookOpen size={18} />}
              iconPosition="start"
              label={`Reading (Band ${reviewData.sections.reading.band})`}
            />
            <Tab
              value="writing"
              icon={<Pencil size={18} />}
              iconPosition="start"
              label={`Writing (Band ${reviewData.sections.writing.band})`}
            />
          </Tabs>
        </Box>
      </Box>

      {/* Main Content */}
      <Box sx={{ maxWidth: 1400, mx: "auto", px: { xs: 2, md: 4 }, py: 3 }}>
        {/* Listening Section */}
        {activeSection === "listening" && (
          <Grid container spacing={3}>
            {/* Left Sidebar */}
            <Grid size={{ xs: 12, md: 3 }}>
              <Paper sx={{ borderRadius: 3, overflow: "hidden", position: "sticky", top: 140 }}>
                <Box sx={{ p: 2, background: "#dbeafe" }}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Headphones size={20} color="#1d4ed8" />
                    <Typography variant="subtitle1" fontWeight={700} color="#1d4ed8">
                      Listening Sections
                    </Typography>
                  </Stack>
                  <Typography variant="body2" color="#1e40af">
                    {reviewData.sections.listening.correct}/{reviewData.sections.listening.total} đúng
                  </Typography>
                </Box>
                <Stack>
                  {reviewData.sections.listening.sections.map((section, index) => (
                    <Button
                      key={section.section}
                      fullWidth
                      onClick={() => setActiveSubSection(index)}
                      sx={{
                        py: 2,
                        px: 2,
                        justifyContent: "flex-start",
                        borderBottom: "1px solid #e5e7eb",
                        bgcolor: activeSubSection === index ? "#eff6ff" : "white",
                        "&:hover": { bgcolor: "#eff6ff" },
                      }}
                    >
                      <Box sx={{ textAlign: "left" }}>
                        <Typography variant="body2" fontWeight={600} color="grey.800">
                          Section {section.section}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {section.name.split(" - ")[1]}
                        </Typography>
                      </Box>
                    </Button>
                  ))}
                </Stack>
              </Paper>
            </Grid>

            {/* Right Content */}
            <Grid size={{ xs: 12, md: 9 }}>
              {reviewData.sections.listening.sections[activeSubSection] && (
                <Box>
                  <Paper sx={{ p: 3, borderRadius: 3, mb: 3 }}>
                    <Typography variant="h5" fontWeight={800} mb={1}>
                      {reviewData.sections.listening.sections[activeSubSection].name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" mb={2}>
                      {reviewData.sections.listening.sections[activeSubSection].description}
                    </Typography>
                    <Button startIcon={<Play size={16} />} variant="outlined" size="small">
                      Nghe lại audio
                    </Button>
                  </Paper>

                  <Stack spacing={3}>
                    {reviewData.sections.listening.sections[activeSubSection].questions.map((q: any) => (
                      <Paper key={q.id} elevation={0} sx={{ borderRadius: 3, border: "1px solid #e5e7eb", overflow: "hidden" }}>
                        <Box sx={{ p: 3 }}>
                          <Typography variant="subtitle2" color="text.secondary" mb={2}>
                            {q.instruction}
                          </Typography>

                          {q.context && (
                            <Typography variant="subtitle1" fontWeight={700} mb={2}>
                              {q.context}
                            </Typography>
                          )}

                          {/* Form Completion / Note Completion */}
                          {q.items && q.type !== "matching" && (
                            <Stack spacing={1.5}>
                              {q.items.map((item: any) => (
                                <Paper
                                  key={item.id}
                                  elevation={0}
                                  sx={{
                                    p: 2,
                                    borderRadius: 2,
                                    bgcolor: item.isCorrect ? "#f0fdf4" : "#fef2f2",
                                    border: `1px solid ${item.isCorrect ? "#d1fae5" : "#fee2e2"}`,
                                  }}
                                >
                                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Box sx={{ flex: 1 }}>
                                      <Typography variant="body2" fontWeight={600}>
                                        {item.label || item.text || item.sentence}
                                      </Typography>
                                      <Stack direction="row" spacing={2} mt={1}>
                                        <Box>
                                          <Typography variant="caption" color="text.secondary">
                                            Bạn trả lời:
                                          </Typography>
                                          <Typography
                                            variant="body2"
                                            fontWeight={600}
                                            color={item.isCorrect ? theme.colors.primary : "#dc2626"}
                                          >
                                            {item.userAnswer}
                                          </Typography>
                                        </Box>
                                        {!item.isCorrect && (
                                          <Box>
                                            <Typography variant="caption" color="text.secondary">
                                              Đáp án đúng:
                                            </Typography>
                                            <Typography variant="body2" fontWeight={600} color={theme.colors.primary}>
                                              {item.correctAnswer}
                                            </Typography>
                                          </Box>
                                        )}
                                      </Stack>
                                      {item.note && (
                                        <Typography variant="caption" color="text.secondary" sx={{ fontStyle: "italic", display: "block", mt: 0.5 }}>
                                          * {item.note}
                                        </Typography>
                                      )}
                                    </Box>
                                    {item.isCorrect ? (
                                      <CheckCircle size={20} color={theme.colors.primary} />
                                    ) : (
                                      <XCircle size={20} color="#dc2626" />
                                    )}
                                  </Stack>
                                </Paper>
                              ))}
                            </Stack>
                          )}

                          {/* Multiple Choice */}
                          {q.options && !q.matchingOptions && (
                            <Stack spacing={1}>
                              {q.options.map((option: any) => {
                                const isCorrect = option.label === q.correctAnswer;
                                const isUserAnswer = option.label === q.userAnswer;
                                return (
                                  <Paper
                                    key={option.label}
                                    elevation={0}
                                    sx={{
                                      p: 1.5,
                                      borderRadius: 2,
                                      border: `1px solid ${isCorrect ? theme.colors.primary : isUserAnswer && !isCorrect ? "#dc2626" : "#e5e7eb"}`,
                                      bgcolor: isCorrect ? "#f0fdf4" : isUserAnswer && !isCorrect ? "#fef2f2" : "white",
                                    }}
                                  >
                                    <Stack direction="row" spacing={1.5} alignItems="center">
                                      <Box
                                        sx={{
                                          width: 24,
                                          height: 24,
                                          borderRadius: "50%",
                                          bgcolor: isCorrect ? theme.colors.primary : isUserAnswer && !isCorrect ? "#dc2626" : "#e5e7eb",
                                          display: "flex",
                                          alignItems: "center",
                                          justifyContent: "center",
                                        }}
                                      >
                                        <Typography variant="caption" fontWeight={700} color={isCorrect || (isUserAnswer && !isCorrect) ? "white" : "grey.600"}>
                                          {option.label}
                                        </Typography>
                                      </Box>
                                      <Typography variant="body2" sx={{ flex: 1 }}>
                                        {option.text}
                                      </Typography>
                                    </Stack>
                                  </Paper>
                                );
                              })}
                            </Stack>
                          )}

                          {/* Explanation */}
                          {q.explanation && (
                            <Paper sx={{ p: 2, mt: 2, bgcolor: "#fffbeb", borderRadius: 2 }}>
                              <Stack direction="row" spacing={1} alignItems="flex-start">
                                <Lightbulb size={16} color="#d97706" style={{ marginTop: 2 }} />
                                <Typography variant="body2" color="#92400e">
                                  {q.explanation}
                                </Typography>
                              </Stack>
                            </Paper>
                          )}

                          {q.tips && (
                            <Paper sx={{ p: 2, mt: 2, bgcolor: "#f0fdf4", borderRadius: 2 }}>
                              <Stack direction="row" spacing={1} alignItems="flex-start">
                                <Target size={16} color={theme.colors.primary} style={{ marginTop: 2 }} />
                                <Typography variant="body2" color={theme.colors.primaryDark}>
                                  <strong>Mẹo:</strong> {q.tips}
                                </Typography>
                              </Stack>
                            </Paper>
                          )}
                        </Box>
                      </Paper>
                    ))}
                  </Stack>
                </Box>
              )}
            </Grid>
          </Grid>
        )}

        {/* Reading Section */}
        {activeSection === "reading" && (
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 3 }}>
              <Paper sx={{ borderRadius: 3, overflow: "hidden", position: "sticky", top: 140 }}>
                <Box sx={{ p: 2, background: "#fef3c7" }}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <BookOpen size={20} color="#92400e" />
                    <Typography variant="subtitle1" fontWeight={700} color="#92400e">
                      Reading Passages
                    </Typography>
                  </Stack>
                  <Typography variant="body2" color="#78350f">
                    {reviewData.sections.reading.correct}/{reviewData.sections.reading.total} đúng
                  </Typography>
                </Box>
                <Stack>
                  {reviewData.sections.reading.passages.map((passage, index) => (
                    <Button
                      key={passage.passage}
                      fullWidth
                      onClick={() => setActiveSubSection(index)}
                      sx={{
                        py: 2,
                        px: 2,
                        justifyContent: "flex-start",
                        borderBottom: "1px solid #e5e7eb",
                        bgcolor: activeSubSection === index ? "#fefce8" : "white",
                        "&:hover": { bgcolor: "#fefce8" },
                      }}
                    >
                      <Box sx={{ textAlign: "left" }}>
                        <Typography variant="body2" fontWeight={600} color="grey.800">
                          Passage {passage.passage}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: "block", maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {passage.title}
                        </Typography>
                      </Box>
                    </Button>
                  ))}
                </Stack>
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, md: 9 }}>
              {reviewData.sections.reading.passages[activeSubSection] && (
                <Box>
                  <Paper sx={{ p: 3, borderRadius: 3, mb: 3 }}>
                    <Typography variant="h5" fontWeight={800} mb={2}>
                      Passage {reviewData.sections.reading.passages[activeSubSection].passage}: {reviewData.sections.reading.passages[activeSubSection].title}
                    </Typography>
                    <Paper sx={{ p: 2, bgcolor: "#f8fafc", borderRadius: 2, maxHeight: 300, overflow: "auto" }}>
                      <Typography variant="body2" sx={{ whiteSpace: "pre-line", lineHeight: 1.8 }}>
                        {reviewData.sections.reading.passages[activeSubSection].text}
                      </Typography>
                    </Paper>
                  </Paper>

                  <Stack spacing={3}>
                    {reviewData.sections.reading.passages[activeSubSection].questions.map((q: any) => (
                      <Paper key={q.id} elevation={0} sx={{ borderRadius: 3, border: "1px solid #e5e7eb", overflow: "hidden" }}>
                        <Box sx={{ p: 3 }}>
                          <Chip
                            label={q.type.replace(/-/g, " ").toUpperCase()}
                            size="small"
                            sx={{ mb: 2, fontWeight: 600, bgcolor: "#fef3c7", color: "#92400e" }}
                          />
                          <Typography variant="subtitle2" color="text.secondary" mb={2}>
                            {q.instruction}
                          </Typography>

                          {q.items && (
                            <Stack spacing={1.5}>
                              {q.items.map((item: any) => (
                                <Paper
                                  key={item.id}
                                  elevation={0}
                                  sx={{
                                    p: 2,
                                    borderRadius: 2,
                                    bgcolor: item.isCorrect ? "#f0fdf4" : "#fef2f2",
                                    border: `1px solid ${item.isCorrect ? "#d1fae5" : "#fee2e2"}`,
                                  }}
                                >
                                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                                    <Box sx={{ flex: 1 }}>
                                      <Typography variant="body2" fontWeight={600} mb={1}>
                                        {item.statement || item.paragraph || item.sentence || `Câu ${item.id}`}
                                      </Typography>
                                      <Stack direction="row" spacing={3}>
                                        <Box>
                                          <Typography variant="caption" color="text.secondary">Bạn trả lời:</Typography>
                                          <Typography variant="body2" fontWeight={600} color={item.isCorrect ? theme.colors.primary : "#dc2626"}>
                                            {item.userAnswer}
                                          </Typography>
                                        </Box>
                                        {!item.isCorrect && (
                                          <Box>
                                            <Typography variant="caption" color="text.secondary">Đáp án đúng:</Typography>
                                            <Typography variant="body2" fontWeight={600} color={theme.colors.primary}>
                                              {item.correctAnswer}
                                            </Typography>
                                          </Box>
                                        )}
                                      </Stack>
                                      {item.explanation && (
                                        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
                                          {item.explanation}
                                        </Typography>
                                      )}
                                    </Box>
                                    {item.isCorrect ? <CheckCircle size={20} color={theme.colors.primary} /> : <XCircle size={20} color="#dc2626" />}
                                  </Stack>
                                </Paper>
                              ))}
                            </Stack>
                          )}

                          {q.explanation && (
                            <Paper sx={{ p: 2, mt: 2, bgcolor: "#fffbeb", borderRadius: 2 }}>
                              <Stack direction="row" spacing={1} alignItems="flex-start">
                                <Lightbulb size={16} color="#d97706" style={{ marginTop: 2 }} />
                                <Typography variant="body2" color="#92400e">{q.explanation}</Typography>
                              </Stack>
                            </Paper>
                          )}

                          {q.tips && (
                            <Paper sx={{ p: 2, mt: 2, bgcolor: "#f0fdf4", borderRadius: 2 }}>
                              <Typography variant="body2" color={theme.colors.primaryDark}>
                                <strong>Mẹo:</strong> {q.tips}
                              </Typography>
                            </Paper>
                          )}
                        </Box>
                      </Paper>
                    ))}
                  </Stack>
                </Box>
              )}
            </Grid>
          </Grid>
        )}

        {/* Writing Section */}
        {activeSection === "writing" && (
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 3 }}>
              <Paper sx={{ borderRadius: 3, overflow: "hidden", position: "sticky", top: 140 }}>
                <Box sx={{ p: 2, background: "#fce7f3" }}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Pencil size={20} color="#be185d" />
                    <Typography variant="subtitle1" fontWeight={700} color="#be185d">
                      Writing Tasks
                    </Typography>
                  </Stack>
                  <Typography variant="body2" color="#9d174d">
                    Band {reviewData.sections.writing.band}
                  </Typography>
                </Box>
                <Stack>
                  {reviewData.sections.writing.tasks.map((task, index) => (
                    <Button
                      key={task.task}
                      fullWidth
                      onClick={() => setActiveSubSection(index)}
                      sx={{
                        py: 2,
                        px: 2,
                        justifyContent: "flex-start",
                        borderBottom: "1px solid #e5e7eb",
                        bgcolor: activeSubSection === index ? "#fdf2f8" : "white",
                        "&:hover": { bgcolor: "#fdf2f8" },
                      }}
                    >
                      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ width: "100%" }}>
                        <Box sx={{ textAlign: "left" }}>
                          <Typography variant="body2" fontWeight={600} color="grey.800">
                            Task {task.task}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {task.type}
                          </Typography>
                        </Box>
                        <Chip label={`${task.band}`} size="small" sx={{ fontWeight: 700, bgcolor: "#fce7f3", color: "#be185d" }} />
                      </Stack>
                    </Button>
                  ))}
                </Stack>
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, md: 9 }}>
              {reviewData.sections.writing.tasks[activeSubSection] && (
                <Box>
                  {(() => {
                    const task = reviewData.sections.writing.tasks[activeSubSection];
                    return (
                      <>
                        {/* Prompt */}
                        <Paper sx={{ p: 3, borderRadius: 3, mb: 3 }}>
                          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                            <Typography variant="h5" fontWeight={800}>
                              Task {task.task}: {task.type}
                            </Typography>
                            <Chip label={`Band ${task.band}`} sx={{ fontWeight: 700, bgcolor: "#fce7f3", color: "#be185d" }} />
                          </Stack>
                          <Paper sx={{ p: 2, bgcolor: "#f8fafc", borderRadius: 2 }}>
                            <Typography variant="body2" fontWeight={600} color="grey.800">
                              {task.prompt}
                            </Typography>
                          </Paper>
                        </Paper>

                        {/* User Response */}
                        <Paper sx={{ p: 3, borderRadius: 3, mb: 3 }}>
                          <Typography variant="h6" fontWeight={700} mb={2}>
                            Bài viết của bạn
                          </Typography>
                          <Paper sx={{ p: 2, bgcolor: "#fefce8", borderRadius: 2, border: "1px solid #fef3c7" }}>
                            <Typography variant="body2" sx={{ whiteSpace: "pre-line", lineHeight: 1.8 }}>
                              {task.userResponse}
                            </Typography>
                          </Paper>
                          <Typography variant="caption" color="text.secondary" mt={1} display="block">
                            Số từ: {task.userResponse.split(/\s+/).length} từ
                          </Typography>
                        </Paper>

                        {/* Detailed Feedback */}
                        <Paper sx={{ p: 3, borderRadius: 3, mb: 3 }}>
                          <Typography variant="h6" fontWeight={700} mb={3}>
                            Nhận xét chi tiết theo 4 tiêu chí
                          </Typography>
                          <Stack spacing={2}>
                            {task.task === 1 ? (
                              <>
                                <WritingCriteriaCard
                                  title="Task Achievement"
                                  band={task.feedback.taskAchievement.band}
                                  comments={task.feedback.taskAchievement.comments}
                                  strengths={task.feedback.taskAchievement.strengths}
                                  improvements={task.feedback.taskAchievement.improvements}
                                />
                                <WritingCriteriaCard
                                  title="Coherence & Cohesion"
                                  band={task.feedback.coherenceCohesion.band}
                                  comments={task.feedback.coherenceCohesion.comments}
                                  strengths={task.feedback.coherenceCohesion.strengths}
                                  improvements={task.feedback.coherenceCohesion.improvements}
                                />
                                <WritingCriteriaCard
                                  title="Lexical Resource"
                                  band={task.feedback.lexicalResource.band}
                                  comments={task.feedback.lexicalResource.comments}
                                  strengths={task.feedback.lexicalResource.strengths}
                                  improvements={task.feedback.lexicalResource.improvements}
                                />
                                <WritingCriteriaCard
                                  title="Grammatical Range & Accuracy"
                                  band={task.feedback.grammaticalRange.band}
                                  comments={task.feedback.grammaticalRange.comments}
                                  strengths={task.feedback.grammaticalRange.strengths}
                                  improvements={task.feedback.grammaticalRange.improvements}
                                />
                              </>
                            ) : (
                              <>
                                <WritingCriteriaCard
                                  title="Task Response"
                                  band={task.feedback.taskResponse.band}
                                  comments={task.feedback.taskResponse.comments}
                                  strengths={task.feedback.taskResponse.strengths}
                                  improvements={task.feedback.taskResponse.improvements}
                                />
                                <WritingCriteriaCard
                                  title="Coherence & Cohesion"
                                  band={task.feedback.coherenceCohesion.band}
                                  comments={task.feedback.coherenceCohesion.comments}
                                  strengths={task.feedback.coherenceCohesion.strengths}
                                  improvements={task.feedback.coherenceCohesion.improvements}
                                />
                                <WritingCriteriaCard
                                  title="Lexical Resource"
                                  band={task.feedback.lexicalResource.band}
                                  comments={task.feedback.lexicalResource.comments}
                                  strengths={task.feedback.lexicalResource.strengths}
                                  improvements={task.feedback.lexicalResource.improvements}
                                />
                                <WritingCriteriaCard
                                  title="Grammatical Range & Accuracy"
                                  band={task.feedback.grammaticalRange.band}
                                  comments={task.feedback.grammaticalRange.comments}
                                  strengths={task.feedback.grammaticalRange.strengths}
                                  improvements={task.feedback.grammaticalRange.improvements}
                                />
                              </>
                            )}
                          </Stack>
                        </Paper>

                        {/* Sample Answer */}
                        <Paper sx={{ p: 3, borderRadius: 3 }}>
                          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Star size={20} color="#fbbf24" fill="#fbbf24" />
                              <Typography variant="h6" fontWeight={700}>
                                Bài mẫu tham khảo (Band 8+)
                              </Typography>
                            </Stack>
                            <Button
                              variant="outlined"
                              size="small"
                              onClick={() => setShowSampleAnswer({ ...showSampleAnswer, [task.task]: !showSampleAnswer[task.task] })}
                              endIcon={showSampleAnswer[task.task] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            >
                              {showSampleAnswer[task.task] ? "Ẩn" : "Xem"} bài mẫu
                            </Button>
                          </Stack>
                          <Collapse in={showSampleAnswer[task.task]}>
                            <Paper sx={{ p: 2, bgcolor: "#f0fdf4", borderRadius: 2, border: `1px solid ${theme.colors.border}` }}>
                              <Typography variant="body2" sx={{ whiteSpace: "pre-line", lineHeight: 1.8 }}>
                                {task.sampleAnswer}
                              </Typography>
                            </Paper>
                          </Collapse>
                        </Paper>
                      </>
                    );
                  })()}
                </Box>
              )}
            </Grid>
          </Grid>
        )}
      </Box>
    </Box>
  );
}
