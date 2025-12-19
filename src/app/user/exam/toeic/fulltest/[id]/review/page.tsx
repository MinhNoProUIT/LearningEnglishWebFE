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
  Divider,
  IconButton,
  Collapse,
  Radio,
  RadioGroup,
  FormControlLabel,
} from "@mui/material";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  Headphones,
  BookOpen,
  Image,
  MessageSquare,
  Users,
  Volume2,
  PenTool,
  FileText,
  BookMarked,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  Play,
  Pause,
  RotateCcw,
} from "lucide-react";
import { examTheme } from "@/components/exam";

const theme = examTheme;

// Mock data - Chi tiết đáp án TOEIC
const mockReviewData = {
  id: 1,
  testTitle: "TOEIC Test 1",
  totalScore: 875,
  maxScore: 990,
  parts: [
    {
      part: 1,
      name: "Photographs",
      category: "Listening",
      icon: "Image",
      questions: [
        {
          id: 1,
          type: "photo",
          imageUrl: "/images/toeic/part1/q1.jpg",
          audioUrl: "/audio/toeic/part1/q1.mp3",
          options: [
            { label: "A", text: "The woman is reading a book." },
            { label: "B", text: "The woman is typing on a computer." },
            { label: "C", text: "The woman is talking on the phone." },
            { label: "D", text: "The woman is writing on a whiteboard." },
          ],
          correctAnswer: "B",
          userAnswer: "B",
          isCorrect: true,
          explanation: "Trong hình, người phụ nữ đang ngồi trước máy tính và gõ bàn phím, do đó đáp án B 'The woman is typing on a computer' là chính xác.",
          tips: "Với Part 1, hãy chú ý đến hành động chính của người/vật trong hình. Loại bỏ các đáp án mô tả hành động không có trong hình.",
        },
        {
          id: 2,
          type: "photo",
          imageUrl: "/images/toeic/part1/q2.jpg",
          audioUrl: "/audio/toeic/part1/q2.mp3",
          options: [
            { label: "A", text: "Cars are parked along the street." },
            { label: "B", text: "People are crossing the street." },
            { label: "C", text: "A bus is stopping at the station." },
            { label: "D", text: "Trees are being planted." },
          ],
          correctAnswer: "A",
          userAnswer: "C",
          isCorrect: false,
          explanation: "Trong hình có nhiều xe ô tô đậu dọc theo con đường. Không có xe buýt hay người đi bộ trong hình. Đáp án A là chính xác.",
          tips: "Lưu ý phân biệt giữa trạng thái (parked - đang đậu) và hành động (parking - đang đậu xe). Đây là điểm hay gây nhầm lẫn trong Part 1.",
        },
      ],
    },
    {
      part: 2,
      name: "Question-Response",
      category: "Listening",
      icon: "MessageSquare",
      questions: [
        {
          id: 7,
          type: "question-response",
          audioUrl: "/audio/toeic/part2/q7.mp3",
          questionText: "Where is the meeting room?",
          options: [
            { label: "A", text: "At 3 o'clock." },
            { label: "B", text: "On the second floor." },
            { label: "C", text: "Yes, I will attend." },
          ],
          correctAnswer: "B",
          userAnswer: "B",
          isCorrect: true,
          explanation: "Câu hỏi 'Where' hỏi về địa điểm, nên đáp án phải trả lời về vị trí. 'On the second floor' (Ở tầng 2) là câu trả lời phù hợp.",
          tips: "Part 2 thường có các bẫy: đáp án A trả lời thời gian (phù hợp với 'When'), đáp án C trả lời Yes/No (phù hợp với câu hỏi Yes/No).",
        },
        {
          id: 8,
          type: "question-response",
          audioUrl: "/audio/toeic/part2/q8.mp3",
          questionText: "Would you like some coffee?",
          options: [
            { label: "A", text: "Yes, please. With sugar." },
            { label: "B", text: "It's on the table." },
            { label: "C", text: "I made it myself." },
          ],
          correctAnswer: "A",
          userAnswer: "A",
          isCorrect: true,
          explanation: "'Would you like...?' là câu hỏi mời, có thể trả lời 'Yes, please' hoặc 'No, thank you'. Đáp án A là phù hợp nhất.",
          tips: "Với câu hỏi 'Would you like...?', đáp án thường là chấp nhận hoặc từ chối lời mời một cách lịch sự.",
        },
      ],
    },
    {
      part: 3,
      name: "Conversations",
      category: "Listening",
      icon: "Users",
      questions: [
        {
          id: 32,
          type: "conversation",
          audioUrl: "/audio/toeic/part3/conv1.mp3",
          conversationText: `Woman: Hi, I'm calling about the job posting for a marketing assistant. Is the position still available?
Man: Yes, it is. We've received many applications, but we're still accepting more until Friday.
Woman: Great! I'd like to apply. What documents do I need to submit?
Man: We need your resume, a cover letter, and two reference letters.`,
          questions: [
            {
              id: 32,
              questionText: "What is the woman calling about?",
              options: [
                { label: "A", text: "To schedule an interview" },
                { label: "B", text: "To inquire about a job opening" },
                { label: "C", text: "To submit her application" },
                { label: "D", text: "To ask about working hours" },
              ],
              correctAnswer: "B",
              userAnswer: "B",
              isCorrect: true,
              explanation: "Người phụ nữ nói 'I'm calling about the job posting' - gọi để hỏi về tin tuyển dụng, tức là hỏi về cơ hội việc làm.",
            },
            {
              id: 33,
              questionText: "When is the application deadline?",
              options: [
                { label: "A", text: "Monday" },
                { label: "B", text: "Wednesday" },
                { label: "C", text: "Friday" },
                { label: "D", text: "Next week" },
              ],
              correctAnswer: "C",
              userAnswer: "C",
              isCorrect: true,
              explanation: "Người đàn ông nói 'we're still accepting more until Friday' - vẫn nhận hồ sơ đến thứ Sáu.",
            },
            {
              id: 34,
              questionText: "What does the man ask the woman to provide?",
              options: [
                { label: "A", text: "Three reference letters" },
                { label: "B", text: "A resume and cover letter only" },
                { label: "C", text: "Resume, cover letter, and two references" },
                { label: "D", text: "Work experience certificates" },
              ],
              correctAnswer: "C",
              userAnswer: "D",
              isCorrect: false,
              explanation: "Người đàn ông liệt kê: 'resume, a cover letter, and two reference letters' - CV, thư xin việc và 2 thư giới thiệu.",
            },
          ],
          tips: "Với Part 3, hãy đọc trước câu hỏi và các đáp án trước khi nghe. Chú ý từ khóa trong câu hỏi để biết cần nghe thông tin gì.",
        },
      ],
    },
    {
      part: 4,
      name: "Talks",
      category: "Listening",
      icon: "Volume2",
      questions: [
        {
          id: 71,
          type: "talk",
          audioUrl: "/audio/toeic/part4/talk1.mp3",
          talkText: `Good morning, everyone. This is your captain speaking. Welcome aboard Flight 247 to Los Angeles. Our flight time today will be approximately 5 hours and 30 minutes. We'll be cruising at an altitude of 35,000 feet. The weather in Los Angeles is currently sunny with a temperature of 75 degrees Fahrenheit. We expect a smooth flight today, but please keep your seatbelts fastened while seated. Our flight attendants will begin beverage service shortly after takeoff. Thank you for choosing our airline, and enjoy your flight.`,
          questions: [
            {
              id: 71,
              questionText: "Where is this announcement being made?",
              options: [
                { label: "A", text: "At an airport terminal" },
                { label: "B", text: "On an airplane" },
                { label: "C", text: "At a train station" },
                { label: "D", text: "On a cruise ship" },
              ],
              correctAnswer: "B",
              userAnswer: "B",
              isCorrect: true,
              explanation: "Người nói là 'captain' và nói 'Welcome aboard Flight 247' - đây là thông báo trên máy bay.",
            },
            {
              id: 72,
              questionText: "How long will the flight take?",
              options: [
                { label: "A", text: "3 hours and 30 minutes" },
                { label: "B", text: "4 hours and 30 minutes" },
                { label: "C", text: "5 hours and 30 minutes" },
                { label: "D", text: "6 hours and 30 minutes" },
              ],
              correctAnswer: "C",
              userAnswer: "C",
              isCorrect: true,
              explanation: "Người nói cho biết 'Our flight time today will be approximately 5 hours and 30 minutes'.",
            },
            {
              id: 73,
              questionText: "What will happen after takeoff?",
              options: [
                { label: "A", text: "A movie will be shown" },
                { label: "B", text: "Meals will be served" },
                { label: "C", text: "Beverage service will begin" },
                { label: "D", text: "Passengers can use electronics" },
              ],
              correctAnswer: "C",
              userAnswer: "A",
              isCorrect: false,
              explanation: "Người nói cho biết 'Our flight attendants will begin beverage service shortly after takeoff' - dịch vụ đồ uống sẽ bắt đầu sau khi cất cánh.",
            },
          ],
          tips: "Part 4 tương tự Part 3 nhưng chỉ có một người nói. Chú ý: What, Where, When, Why, Who để xác định thông tin chính.",
        },
        {
          id: 74,
          type: "talk",
          audioUrl: "/audio/toeic/part4/talk2.mp3",
          talkText: `Attention shoppers! For the next hour only, we're offering a special discount in our electronics department. All laptop computers are now 30% off the original price. This includes our popular brands such as Dell, HP, and Lenovo. Additionally, if you purchase a laptop today, you'll receive a free carrying case worth $50. This offer is valid only until 3 PM, so hurry to the electronics department on the second floor. Our knowledgeable staff will be happy to assist you with your purchase.`,
          questions: [
            {
              id: 74,
              questionText: "What type of business is making this announcement?",
              options: [
                { label: "A", text: "A computer repair shop" },
                { label: "B", text: "A retail store" },
                { label: "C", text: "An electronics factory" },
                { label: "D", text: "A software company" },
              ],
              correctAnswer: "B",
              userAnswer: "B",
              isCorrect: true,
              explanation: "'Attention shoppers' và 'electronics department on the second floor' cho thấy đây là cửa hàng bán lẻ.",
            },
            {
              id: 75,
              questionText: "What is being offered for free?",
              options: [
                { label: "A", text: "A mouse" },
                { label: "B", text: "Software" },
                { label: "C", text: "A carrying case" },
                { label: "D", text: "A warranty extension" },
              ],
              correctAnswer: "C",
              userAnswer: "C",
              isCorrect: true,
              explanation: "Thông báo nói 'you'll receive a free carrying case worth $50' - nhận miễn phí túi đựng laptop.",
            },
            {
              id: 76,
              questionText: "Until what time is the offer valid?",
              options: [
                { label: "A", text: "1 PM" },
                { label: "B", text: "2 PM" },
                { label: "C", text: "3 PM" },
                { label: "D", text: "4 PM" },
              ],
              correctAnswer: "C",
              userAnswer: "D",
              isCorrect: false,
              explanation: "Thông báo ghi rõ 'This offer is valid only until 3 PM' - ưu đãi có hiệu lực đến 3 giờ chiều.",
            },
          ],
          tips: "Với các thông báo khuyến mãi, chú ý: mức giảm giá (%), thời hạn (until, by), điều kiện áp dụng.",
        },
      ],
    },
    {
      part: 5,
      name: "Incomplete Sentences",
      category: "Reading",
      icon: "PenTool",
      questions: [
        {
          id: 101,
          type: "incomplete-sentence",
          questionText: "The company's new policy requires all employees to submit their reports _______ the end of each month.",
          options: [
            { label: "A", text: "by" },
            { label: "B", text: "until" },
            { label: "C", text: "within" },
            { label: "D", text: "during" },
          ],
          correctAnswer: "A",
          userAnswer: "A",
          isCorrect: true,
          explanation: "'By' được dùng để chỉ thời hạn (deadline) - 'by the end of each month' nghĩa là 'trước cuối mỗi tháng'. 'Until' chỉ khoảng thời gian kéo dài, 'within' chỉ trong khoảng, 'during' chỉ trong suốt.",
          tips: "Phân biệt giới từ chỉ thời gian: BY (trước thời điểm), UNTIL (cho đến), WITHIN (trong vòng), DURING (trong suốt).",
          grammarPoint: "Prepositions of Time",
        },
        {
          id: 102,
          type: "incomplete-sentence",
          questionText: "The marketing team worked _______ to meet the deadline for the product launch.",
          options: [
            { label: "A", text: "tireless" },
            { label: "B", text: "tirelessly" },
            { label: "C", text: "tirelessness" },
            { label: "D", text: "tiring" },
          ],
          correctAnswer: "B",
          userAnswer: "B",
          isCorrect: true,
          explanation: "Cần một trạng từ (adverb) để bổ nghĩa cho động từ 'worked'. 'Tirelessly' (không mệt mỏi) là trạng từ đúng. 'Tireless' là tính từ, 'tirelessness' là danh từ.",
          tips: "Xác định từ loại cần điền: sau động từ thường cần trạng từ (-ly), trước danh từ cần tính từ.",
          grammarPoint: "Word Forms - Adverbs",
        },
      ],
    },
    {
      part: 6,
      name: "Text Completion",
      category: "Reading",
      icon: "FileText",
      questions: [
        {
          id: 131,
          type: "text-completion",
          passage: `Dear Mr. Johnson,

Thank you for your interest in our company. We are pleased to inform you that your application for the Software Developer position has been _______ (131).

We would like to invite you for an interview on March 15th at 10:00 AM. Please _______ (132) this email to confirm your attendance.

We look forward to meeting you.

Best regards,
HR Department`,
          questions: [
            {
              id: 131,
              questionText: "_______ (131)",
              options: [
                { label: "A", text: "accepted" },
                { label: "B", text: "accepting" },
                { label: "C", text: "acceptance" },
                { label: "D", text: "acceptable" },
              ],
              correctAnswer: "A",
              userAnswer: "A",
              isCorrect: true,
              explanation: "Cấu trúc bị động 'has been + V3/ed'. 'Accepted' là dạng quá khứ phân từ phù hợp với nghĩa 'đã được chấp nhận'.",
            },
            {
              id: 132,
              questionText: "_______ (132)",
              options: [
                { label: "A", text: "respond" },
                { label: "B", text: "reply to" },
                { label: "C", text: "answer" },
                { label: "D", text: "react" },
              ],
              correctAnswer: "B",
              userAnswer: "A",
              isCorrect: false,
              explanation: "'Reply to' + email/letter là cách dùng chuẩn. 'Respond' cần thêm 'to'. 'Answer' thường dùng với question, phone.",
            },
          ],
          tips: "Part 6 kết hợp ngữ pháp và từ vựng. Cần đọc cả đoạn văn để hiểu ngữ cảnh, không chỉ nhìn câu chứa chỗ trống.",
        },
      ],
    },
    {
      part: 7,
      name: "Reading Comprehension",
      category: "Reading",
      icon: "BookMarked",
      questions: [
        {
          id: 147,
          type: "single-passage",
          passage: `NOTICE TO ALL EMPLOYEES

Effective April 1st, the company cafeteria will extend its operating hours. The new schedule will be as follows:

Breakfast: 7:00 AM - 9:30 AM
Lunch: 11:30 AM - 2:00 PM
Dinner: 5:30 PM - 8:00 PM

Additionally, a new salad bar will be introduced, offering fresh vegetables and healthy options daily. Employees who wish to provide feedback about the cafeteria services can fill out the suggestion form available at the front desk.

We appreciate your continued support in making our workplace a better environment for everyone.

Management`,
          questions: [
            {
              id: 147,
              questionText: "What is the purpose of this notice?",
              options: [
                { label: "A", text: "To announce a new restaurant opening" },
                { label: "B", text: "To inform about changes in cafeteria services" },
                { label: "C", text: "To advertise healthy food products" },
                { label: "D", text: "To request employee volunteers" },
              ],
              correctAnswer: "B",
              userAnswer: "B",
              isCorrect: true,
              explanation: "Thông báo nói về việc mở rộng giờ hoạt động và thêm salad bar mới - đây là những thay đổi về dịch vụ căn tin.",
            },
            {
              id: 148,
              questionText: "When will the changes take effect?",
              options: [
                { label: "A", text: "Immediately" },
                { label: "B", text: "Next week" },
                { label: "C", text: "April 1st" },
                { label: "D", text: "The following month" },
              ],
              correctAnswer: "C",
              userAnswer: "C",
              isCorrect: true,
              explanation: "Dòng đầu tiên ghi rõ 'Effective April 1st' - có hiệu lực từ ngày 1 tháng 4.",
            },
            {
              id: 149,
              questionText: "How can employees give feedback?",
              options: [
                { label: "A", text: "By emailing the management" },
                { label: "B", text: "By calling the cafeteria" },
                { label: "C", text: "By filling out a suggestion form" },
                { label: "D", text: "By attending a meeting" },
              ],
              correctAnswer: "C",
              userAnswer: "C",
              isCorrect: true,
              explanation: "Đoạn văn nói 'fill out the suggestion form available at the front desk' - điền vào mẫu góp ý ở quầy lễ tân.",
            },
          ],
          tips: "Với Part 7, đọc câu hỏi trước để biết cần tìm thông tin gì. Các câu hỏi thường đi theo thứ tự của thông tin trong bài.",
        },
        {
          id: 176,
          type: "double-passage",
          passage: `[Email 1]
From: Sarah Johnson <sjohnson@techcorp.com>
To: All Staff
Subject: Office Renovation Schedule
Date: March 15

Dear colleagues,

Please be informed that our office will undergo renovation starting April 3rd. The work will primarily affect the third floor, including the conference rooms and break area. During this period, meetings can be held in the temporary meeting rooms set up on the first floor.

The renovation is expected to be completed by April 20th. We apologize for any inconvenience this may cause.

Best regards,
Sarah Johnson
Facilities Manager

---

[Email 2]
From: Michael Chen <mchen@techcorp.com>
To: Sarah Johnson <sjohnson@techcorp.com>
Subject: RE: Office Renovation Schedule
Date: March 16

Hi Sarah,

Thank you for the update. I have a client presentation scheduled for April 10th in Conference Room A on the third floor. Could you please confirm if the temporary meeting rooms on the first floor have video conferencing capabilities?

Also, will there be parking restrictions during the renovation?

Thanks,
Michael Chen
Sales Director`,
          questions: [
            {
              id: 176,
              questionText: "What is the main purpose of the first email?",
              options: [
                { label: "A", text: "To request approval for renovation" },
                { label: "B", text: "To announce upcoming office changes" },
                { label: "C", text: "To assign new office spaces" },
                { label: "D", text: "To schedule a meeting" },
              ],
              correctAnswer: "B",
              userAnswer: "B",
              isCorrect: true,
              explanation: "Email đầu thông báo về kế hoạch sửa chữa văn phòng sắp tới - 'our office will undergo renovation'.",
            },
            {
              id: 177,
              questionText: "Which floor will be most affected by the renovation?",
              options: [
                { label: "A", text: "First floor" },
                { label: "B", text: "Second floor" },
                { label: "C", text: "Third floor" },
                { label: "D", text: "Fourth floor" },
              ],
              correctAnswer: "C",
              userAnswer: "A",
              isCorrect: false,
              explanation: "Email ghi 'The work will primarily affect the third floor' - công việc chủ yếu ảnh hưởng đến tầng 3.",
            },
            {
              id: 178,
              questionText: "What does Michael Chen want to know?",
              options: [
                { label: "A", text: "When the renovation will start" },
                { label: "B", text: "If temporary rooms have certain equipment" },
                { label: "C", text: "How to reschedule his meeting" },
                { label: "D", text: "Who will attend his presentation" },
              ],
              correctAnswer: "B",
              userAnswer: "B",
              isCorrect: true,
              explanation: "Michael hỏi 'Could you please confirm if the temporary meeting rooms... have video conferencing capabilities?'",
            },
            {
              id: 179,
              questionText: "When is Michael's presentation scheduled?",
              options: [
                { label: "A", text: "March 15th" },
                { label: "B", text: "April 3rd" },
                { label: "C", text: "April 10th" },
                { label: "D", text: "April 20th" },
              ],
              correctAnswer: "C",
              userAnswer: "C",
              isCorrect: true,
              explanation: "Michael nói 'I have a client presentation scheduled for April 10th'.",
            },
            {
              id: 180,
              questionText: "What is Michael Chen's position?",
              options: [
                { label: "A", text: "Facilities Manager" },
                { label: "B", text: "Sales Director" },
                { label: "C", text: "IT Manager" },
                { label: "D", text: "Human Resources" },
              ],
              correctAnswer: "B",
              userAnswer: "B",
              isCorrect: true,
              explanation: "Cuối email 2 ghi 'Michael Chen, Sales Director'.",
            },
          ],
          tips: "Với Double Passage, chú ý mối quan hệ giữa 2 văn bản. Thường có câu hỏi yêu cầu kết hợp thông tin từ cả 2 bài.",
        },
      ],
    },
  ],
};

// Part Icon mapping
const partIcons: Record<string, React.ReactNode> = {
  Image: <Image size={20} color="white" />,
  MessageSquare: <MessageSquare size={20} color="white" />,
  Users: <Users size={20} color="white" />,
  Volume2: <Volume2 size={20} color="white" />,
  PenTool: <PenTool size={20} color="white" />,
  FileText: <FileText size={20} color="white" />,
  BookMarked: <BookMarked size={20} color="white" />,
};

// Question Review Card Component
const QuestionReviewCard = ({ question, showExplanation, onToggleExplanation }: {
  question: any;
  showExplanation: boolean;
  onToggleExplanation: () => void;
}) => {
  // Tính toán isCorrect: nếu có sub-questions thì kiểm tra tất cả, không thì dùng trực tiếp
  const hasSubQuestions = question.questions && question.questions.length > 0;
  const correctCount = hasSubQuestions
    ? question.questions.filter((q: any) => q.isCorrect).length
    : (question.isCorrect ? 1 : 0);
  const totalCount = hasSubQuestions ? question.questions.length : 1;
  const allCorrect = correctCount === totalCount;
  const someCorrect = correctCount > 0 && correctCount < totalCount;

  // Hiển thị số câu đúng/sai cho các câu có sub-questions
  const displayId = hasSubQuestions
    ? `${question.questions[0].id}-${question.questions[question.questions.length - 1].id}`
    : question.id;

  // Nếu là câu đơn (Part 1, 2, 5), hiển thị card với header đúng/sai
  // Nếu có sub-questions (Part 3, 4, 6, 7), hiển thị card tổng quan + từng sub-question riêng
  const isSingleQuestion = !hasSubQuestions;

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 3,
        border: `2px solid ${isSingleQuestion ? (allCorrect ? "#d1fae5" : "#fee2e2") : "#e5e7eb"}`,
        overflow: "hidden",
      }}
    >
      {/* Question Header */}
      <Box
        sx={{
          p: 2,
          bgcolor: isSingleQuestion
            ? (allCorrect ? "#f0fdf4" : "#fef2f2")
            : "#f8fafc",
          borderBottom: "1px solid #e5e7eb",
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack direction="row" spacing={2} alignItems="center">
            {isSingleQuestion ? (
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  bgcolor: allCorrect ? theme.colors.primary : "#dc2626",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {allCorrect ? (
                  <CheckCircle size={20} color="white" />
                ) : (
                  <XCircle size={20} color="white" />
                )}
              </Box>
            ) : (
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 2,
                  background: theme.gradients.primary,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <FileText size={20} color="white" />
              </Box>
            )}
            <Box>
              <Typography variant="subtitle1" fontWeight={700}>
                {hasSubQuestions ? `Câu ${displayId}` : `Câu ${displayId}`}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {hasSubQuestions
                  ? `${correctCount}/${totalCount} câu đúng`
                  : (allCorrect ? "Trả lời đúng" : "Trả lời sai")}
              </Typography>
            </Box>
          </Stack>
          <Stack direction="row" spacing={1}>
            {question.audioUrl && (
              <IconButton size="small" sx={{ bgcolor: "#e5e7eb" }}>
                <Play size={16} />
              </IconButton>
            )}
          </Stack>
        </Stack>
      </Box>

      {/* Question Content */}
      <Box sx={{ p: 3 }}>
        {/* Image for Part 1 */}
        {question.imageUrl && (
          <Box
            sx={{
              width: "100%",
              height: 200,
              bgcolor: "#f3f4f6",
              borderRadius: 2,
              mb: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography variant="body2" color="text.secondary">
              [Hình ảnh câu hỏi]
            </Typography>
          </Box>
        )}

        {/* Conversation Text for Part 3 */}
        {question.conversationText && (
          <Paper sx={{ p: 2, bgcolor: "#f8fafc", borderRadius: 2, mb: 2 }}>
            <Typography variant="body2" sx={{ whiteSpace: "pre-line", lineHeight: 1.8 }}>
              {question.conversationText}
            </Typography>
          </Paper>
        )}

        {/* Talk Text for Part 4 */}
        {question.talkText && (
          <Paper sx={{ p: 2, bgcolor: "#f8fafc", borderRadius: 2, mb: 2 }}>
            <Typography variant="body2" sx={{ whiteSpace: "pre-line", lineHeight: 1.8 }}>
              {question.talkText}
            </Typography>
          </Paper>
        )}

        {/* Passage for Part 6, 7 */}
        {question.passage && (
          <Paper sx={{ p: 2, bgcolor: "#f8fafc", borderRadius: 2, mb: 2 }}>
            <Typography variant="body2" sx={{ whiteSpace: "pre-line", lineHeight: 1.8 }}>
              {question.passage}
            </Typography>
          </Paper>
        )}

        {/* Question Text */}
        {question.questionText && (
          <Typography variant="body1" fontWeight={600} mb={2}>
            {question.questionText}
          </Typography>
        )}

        {/* Options */}
        {question.options && (
          <Stack spacing={1.5}>
            {question.options.map((option: any) => {
              const isCorrect = option.label === question.correctAnswer;
              const isUserAnswer = option.label === question.userAnswer;
              const showAsCorrect = isCorrect;
              const showAsWrong = isUserAnswer && !isCorrect;

              return (
                <Paper
                  key={option.label}
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    border: "2px solid",
                    borderColor: showAsCorrect
                      ? theme.colors.primary
                      : showAsWrong
                      ? "#dc2626"
                      : "#e5e7eb",
                    bgcolor: showAsCorrect
                      ? "#f0fdf4"
                      : showAsWrong
                      ? "#fef2f2"
                      : "white",
                  }}
                >
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        bgcolor: showAsCorrect
                          ? theme.colors.primary
                          : showAsWrong
                          ? "#dc2626"
                          : "#e5e7eb",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Typography
                        variant="body2"
                        fontWeight={700}
                        color={showAsCorrect || showAsWrong ? "white" : "grey.600"}
                      >
                        {option.label}
                      </Typography>
                    </Box>
                    <Typography
                      variant="body2"
                      fontWeight={showAsCorrect || showAsWrong ? 600 : 400}
                      color={showAsCorrect ? theme.colors.primaryDark : showAsWrong ? "#dc2626" : "grey.800"}
                      sx={{ flex: 1 }}
                    >
                      {option.text}
                    </Typography>
                    {showAsCorrect && <CheckCircle size={18} color={theme.colors.primary} />}
                    {showAsWrong && <XCircle size={18} color="#dc2626" />}
                  </Stack>
                </Paper>
              );
            })}
          </Stack>
        )}

        {/* Sub-questions for Part 3, 4, 6, 7 */}
        {question.questions && (
          <Stack spacing={3} mt={2}>
            {question.questions.map((subQ: any) => (
              <Paper
                key={subQ.id}
                elevation={0}
                sx={{
                  borderRadius: 2,
                  border: `2px solid ${subQ.isCorrect ? "#d1fae5" : "#fee2e2"}`,
                  overflow: "hidden",
                }}
              >
                {/* Sub-question Header */}
                <Box
                  sx={{
                    p: 1.5,
                    bgcolor: subQ.isCorrect ? "#f0fdf4" : "#fef2f2",
                    borderBottom: "1px solid #e5e7eb",
                  }}
                >
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Box
                      sx={{
                        width: 28,
                        height: 28,
                        borderRadius: "50%",
                        bgcolor: subQ.isCorrect ? theme.colors.primary : "#dc2626",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {subQ.isCorrect ? (
                        <CheckCircle size={16} color="white" />
                      ) : (
                        <XCircle size={16} color="white" />
                      )}
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" fontWeight={700}>
                        Câu {subQ.id}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {subQ.isCorrect ? "Trả lời đúng" : "Trả lời sai"}
                      </Typography>
                    </Box>
                  </Stack>
                </Box>

                {/* Sub-question Content */}
                <Box sx={{ p: 2 }}>
                  <Typography variant="body2" fontWeight={600} mb={1.5}>
                    {subQ.questionText}
                  </Typography>
                  <Stack spacing={1}>
                    {subQ.options.map((option: any) => {
                      const isCorrect = option.label === subQ.correctAnswer;
                      const isUserAnswer = option.label === subQ.userAnswer;
                      const showAsCorrect = isCorrect;
                      const showAsWrong = isUserAnswer && !isCorrect;

                      return (
                        <Paper
                          key={option.label}
                          elevation={0}
                          sx={{
                            p: 1.5,
                            borderRadius: 2,
                            border: "1px solid",
                            borderColor: showAsCorrect
                              ? theme.colors.primary
                              : showAsWrong
                              ? "#dc2626"
                              : "#e5e7eb",
                            bgcolor: showAsCorrect
                              ? "#f0fdf4"
                              : showAsWrong
                              ? "#fef2f2"
                              : "white",
                          }}
                        >
                          <Stack direction="row" spacing={1.5} alignItems="center">
                            <Box
                              sx={{
                                width: 24,
                                height: 24,
                                borderRadius: "50%",
                                bgcolor: showAsCorrect
                                  ? theme.colors.primary
                                  : showAsWrong
                                  ? "#dc2626"
                                  : "#e5e7eb",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <Typography
                                variant="caption"
                                fontWeight={700}
                                color={showAsCorrect || showAsWrong ? "white" : "grey.600"}
                              >
                                {option.label}
                              </Typography>
                            </Box>
                            <Typography variant="body2" sx={{ flex: 1 }}>
                              {option.text}
                            </Typography>
                            {showAsCorrect && <CheckCircle size={16} color={theme.colors.primary} />}
                            {showAsWrong && <XCircle size={16} color="#dc2626" />}
                          </Stack>
                        </Paper>
                      );
                    })}
                  </Stack>
                  {subQ.explanation && (
                    <Paper sx={{ p: 2, mt: 1.5, bgcolor: "#fffbeb", borderRadius: 2, border: "1px solid #fef3c7" }}>
                      <Stack direction="row" spacing={1} alignItems="flex-start">
                        <Lightbulb size={16} color="#d97706" style={{ marginTop: 2 }} />
                        <Typography variant="body2" color="#92400e">
                          {subQ.explanation}
                        </Typography>
                      </Stack>
                    </Paper>
                  )}
                </Box>
              </Paper>
            ))}
          </Stack>
        )}
      </Box>

      {/* Explanation Section */}
      <Box sx={{ borderTop: "1px solid #e5e7eb" }}>
        <Button
          fullWidth
          onClick={onToggleExplanation}
          endIcon={showExplanation ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          sx={{
            py: 1.5,
            justifyContent: "space-between",
            px: 3,
            color: theme.colors.primaryDark,
            "&:hover": { bgcolor: "#f0fdf4" },
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <Lightbulb size={18} />
            <span>Giải thích & Mẹo</span>
          </Stack>
        </Button>

        <Collapse in={showExplanation}>
          <Box sx={{ p: 3, pt: 0 }}>
            {question.explanation && (
              <Paper sx={{ p: 2, bgcolor: "#f0fdf4", borderRadius: 2, mb: 2 }}>
                <Typography variant="subtitle2" fontWeight={700} color={theme.colors.primaryDark} mb={1}>
                  Giải thích:
                </Typography>
                <Typography variant="body2" color="grey.700">
                  {question.explanation}
                </Typography>
              </Paper>
            )}

            {question.tips && (
              <Paper sx={{ p: 2, bgcolor: "#fffbeb", borderRadius: 2, border: "1px solid #fef3c7" }}>
                <Typography variant="subtitle2" fontWeight={700} color="#92400e" mb={1}>
                  Mẹo làm bài:
                </Typography>
                <Typography variant="body2" color="#78350f">
                  {question.tips}
                </Typography>
              </Paper>
            )}

            {question.grammarPoint && (
              <Chip
                label={`Điểm ngữ pháp: ${question.grammarPoint}`}
                size="small"
                sx={{ mt: 2, bgcolor: "#dbeafe", color: "#1d4ed8", fontWeight: 600 }}
              />
            )}
          </Box>
        </Collapse>
      </Box>
    </Paper>
  );
};

export default function ToeicReviewPage() {
  const router = useRouter();
  const params = useParams();
  const [activePart, setActivePart] = useState(0);
  const [expandedQuestions, setExpandedQuestions] = useState<Set<number>>(new Set());

  const reviewData = mockReviewData;
  const currentPart = reviewData.parts[activePart];

  const toggleExplanation = (questionId: number) => {
    const newExpanded = new Set(expandedQuestions);
    if (newExpanded.has(questionId)) {
      newExpanded.delete(questionId);
    } else {
      newExpanded.add(questionId);
    }
    setExpandedQuestions(newExpanded);
  };

  // Calculate stats
  const partStats = reviewData.parts.map((part) => {
    let correct = 0;
    let total = 0;
    part.questions.forEach((q) => {
      if (q.questions) {
        q.questions.forEach((subQ: any) => {
          total++;
          if (subQ.isCorrect) correct++;
        });
      } else {
        total++;
        if (q.isCorrect) correct++;
      }
    });
    return { correct, total };
  });

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
                onClick={() => router.push(`/user/exam/toeic/fulltest/${params.id}/result`)}
                sx={{ color: "white" }}
              >
                <ArrowLeft size={24} />
              </IconButton>
              <Box>
                <Typography variant="h6" fontWeight={700} color="white">
                  {reviewData.testTitle} - Xem đáp án chi tiết
                </Typography>
                <Typography variant="body2" color="rgba(255,255,255,0.8)">
                  Điểm: {reviewData.totalScore}/{reviewData.maxScore}
                </Typography>
              </Box>
            </Stack>

            <Button
              variant="contained"
              startIcon={<RotateCcw size={18} />}
              onClick={() => router.push(`/user/exam/toeic/fulltest/${params.id}`)}
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

      {/* Main Content */}
      <Box sx={{ maxWidth: 1400, mx: "auto", px: { xs: 2, md: 4 }, py: 3 }}>
        <Grid container spacing={3}>
          {/* Left Sidebar - Part Navigation */}
          <Grid size={{ xs: 12, md: 3 }}>
            <Paper sx={{ borderRadius: 3, overflow: "hidden", position: "sticky", top: 100 }}>
              <Box sx={{ p: 2, background: theme.gradients.primary }}>
                <Typography variant="subtitle1" fontWeight={700} color="white">
                  Chọn Part
                </Typography>
              </Box>
              <Stack>
                {reviewData.parts.map((part, index) => (
                  <Button
                    key={part.part}
                    fullWidth
                    onClick={() => setActivePart(index)}
                    sx={{
                      py: 2,
                      px: 2,
                      justifyContent: "flex-start",
                      borderBottom: "1px solid #e5e7eb",
                      bgcolor: activePart === index ? "#f0fdf4" : "white",
                      "&:hover": { bgcolor: "#f0fdf4" },
                    }}
                  >
                    <Stack direction="row" spacing={2} alignItems="center" sx={{ width: "100%" }}>
                      <Box
                        sx={{
                          width: 36,
                          height: 36,
                          borderRadius: 2,
                          background: activePart === index ? theme.gradients.primary : "#e5e7eb",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {partIcons[part.icon]}
                      </Box>
                      <Box sx={{ flex: 1, textAlign: "left" }}>
                        <Typography variant="body2" fontWeight={600} color="grey.800">
                          Part {part.part}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {partStats[index].correct}/{partStats[index].total} đúng
                        </Typography>
                      </Box>
                      <Chip
                        label={part.category === "Listening" ? "L" : "R"}
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: "0.65rem",
                          bgcolor: part.category === "Listening" ? "#dbeafe" : "#fef3c7",
                          color: part.category === "Listening" ? "#1d4ed8" : "#92400e",
                        }}
                      />
                    </Stack>
                  </Button>
                ))}
              </Stack>
            </Paper>
          </Grid>

          {/* Right Content - Questions */}
          <Grid size={{ xs: 12, md: 9 }}>
            {/* Part Header */}
            <Paper sx={{ p: 3, borderRadius: 3, mb: 3 }}>
              <Stack direction="row" spacing={3} alignItems="center">
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: 3,
                    background: theme.gradients.primary,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {partIcons[currentPart.icon]}
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Stack direction="row" spacing={1} alignItems="center" mb={0.5}>
                    <Typography variant="h5" fontWeight={800}>
                      Part {currentPart.part}: {currentPart.name}
                    </Typography>
                    <Chip
                      label={currentPart.category}
                      size="small"
                      icon={currentPart.category === "Listening" ? <Headphones size={12} /> : <BookOpen size={12} />}
                      sx={{
                        bgcolor: currentPart.category === "Listening" ? "#dbeafe" : "#fef3c7",
                        color: currentPart.category === "Listening" ? "#1d4ed8" : "#92400e",
                        "& .MuiChip-icon": { color: "inherit" },
                      }}
                    />
                  </Stack>
                  <Typography variant="body2" color="text.secondary">
                    Kết quả: {partStats[activePart].correct}/{partStats[activePart].total} câu đúng (
                    {((partStats[activePart].correct / partStats[activePart].total) * 100).toFixed(0)}%)
                  </Typography>
                </Box>
              </Stack>
            </Paper>

            {/* Questions List */}
            <Stack spacing={3}>
              {currentPart.questions.map((question) => (
                <QuestionReviewCard
                  key={question.id}
                  question={question}
                  showExplanation={expandedQuestions.has(question.id)}
                  onToggleExplanation={() => toggleExplanation(question.id)}
                />
              ))}
            </Stack>

            {/* Navigation */}
            <Stack direction="row" justifyContent="space-between" mt={4}>
              <Button
                variant="outlined"
                startIcon={<ChevronLeft size={18} />}
                disabled={activePart === 0}
                onClick={() => setActivePart(activePart - 1)}
                sx={{ borderColor: theme.colors.primary, color: theme.colors.primary }}
              >
                Part trước
              </Button>
              <Button
                variant="contained"
                endIcon={<ChevronRight size={18} />}
                disabled={activePart === reviewData.parts.length - 1}
                onClick={() => setActivePart(activePart + 1)}
                sx={{ background: theme.gradients.primary }}
              >
                Part tiếp
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
