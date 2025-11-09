import React, { useState } from "react";
import { Box, Tab, Tabs as MUITabs } from "@mui/material";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

// Component cho nội dung của từng tab
function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

// Props cho tab
function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

interface TabData {
  label: string;
  content: React.ReactNode;
}

interface CustomTabsProps {
  tabs: TabData[];
}

export default function CustomTabs({ tabs }: CustomTabsProps) {
  const [value, setValue] = useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <MUITabs
          value={value}
          onChange={handleChange}
          sx={{
            "& .MuiTab-root": {
              color: "var(--text-color)",
              "&.Mui-selected": {
                color: "var(--selected-tab)",
              },
            },
            "& .MuiTabs-indicator": {
              backgroundColor: "var(--selected-tab)",
            },
          }}
        >
          {tabs.map((tab, index) => (
            <Tab
              key={index}
              label={tab.label}
              {...a11yProps(index)}
              sx={{
                textTransform: "none",
                fontSize: "16px",
                fontWeight: "medium",
              }}
            />
          ))}
        </MUITabs>
      </Box>
      {tabs.map((tab, index) => (
        <CustomTabPanel key={index} value={value} index={index}>
          {tab.content}
        </CustomTabPanel>
      ))}
    </Box>
  );
}
