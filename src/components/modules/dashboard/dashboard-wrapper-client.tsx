"use client";

import { useSpace } from "@/components/providers/space-provider";
import { DaaraDashboardClient } from "@/components/modules/dashboard/daara-dashboard-client";
import { JanguDashboardClient } from "@/components/modules/dashboard/jangu-dashboard-client";

interface DashboardWrapperClientProps {
  // Props pour Daara
  daaraName: string;
  totalTalibes: number;
  totalInternes: number;
  totalHalqas: number;
  totalSponsorships: number;
  hifzRecordsToday: number;
  recentHifz: any[];
  userRole: string;

  // Props pour École Franco-Arabe / School
  schoolName?: string;
  totalClasses?: number;
  totalTeachers?: number;
  totalAmountDue?: number;
  totalAmountPaid?: number;
  collectionRate?: number;
  recentTuitions?: any[];
  currentMonth?: number;
  currentYear?: number;
}

export function DashboardWrapperClient(props: DashboardWrapperClientProps) {
  const { activeSpace } = useSpace();

  if (activeSpace === "school") {
    return (
      <JanguDashboardClient 
        schoolName={props.schoolName || "École Franco-Arabe Pathé Pogne"}
        totalStudents={props.totalTalibes}
        totalClasses={props.totalClasses || 8}
        totalTeachers={props.totalTeachers || 12}
        totalAmountDue={props.totalAmountDue || 1500000}
        totalAmountPaid={props.totalAmountPaid || 1125000}
        collectionRate={props.collectionRate || 75}
        recentTuitions={props.recentTuitions || []}
        currentMonth={props.currentMonth || new Date().getMonth() + 1}
        currentYear={props.currentYear || new Date().getFullYear()}
        userRole={props.userRole}
      />
    );
  }

  return (
    <DaaraDashboardClient 
      daaraName={props.daaraName}
      totalTalibes={props.totalTalibes}
      totalInternes={props.totalInternes}
      totalHalqas={props.totalHalqas}
      totalSponsorships={props.totalSponsorships}
      hifzRecordsToday={props.hifzRecordsToday}
      recentHifz={props.recentHifz}
      userRole={props.userRole}
    />
  );
}
