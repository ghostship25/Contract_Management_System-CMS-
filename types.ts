
export interface PBData {
  id: string;
  institution: string;
  no: string;
  amount: string;
  expiry: string;
  remarks: string;
}

export interface APGData {
  id: string;
  institution: string;
  no: string;
  amount: string;
  expiry: string;
  remarks: string;
}

export interface InsuranceData {
  id: string;
  institution: string;
  no: string;
  expiry: string;
  remarks: string;
}

export interface InstallmentData {
  id: string;
  amount: string;
  payoutDate: string;
  evaluationAmount: string;
  remarks: string;
}

export interface Contract {
  id: string;
  fiscalYear: string;
  tenderNo: string;
  noticeDate: string;
  projectName: string;
  totalEstCost: string;
  grantTitle: string;
  municipalityGrant: string;
  wardNo: string;
  projectType: string;
  projectMode: string;
  budgetThisFY: string;
  sourceAssuranceRequired: boolean;
  assuredSource: string;
  contractAmount: string;
  contractDate: string;
  completionDate: string;
  physicalProgress: string;
  extensionDate: string;
  extendedPeriod: string;
  siteInCharge: string;
  contactNo: string;
  projectStatus: string;
  operationDecision: string;
  paymentAmount: string;
  paymentDate: string;
  firmName: string;
  firmAddress: string;
  proprietorName: string;
  proprietorContact: string;
  panNo: string;
  
  // Performance Bonds (Multiple)
  pbRecords: PBData[];
  
  // Advance Payment Guarantees (Multiple)
  apgRecords: APGData[];
  
  // Insurances (Multiple)
  insuranceRecords: InsuranceData[];
  
  // Other Docs
  otherDocInst: string;
  otherDocNo: string;
  otherDocRemarks: string;

  // Progress tracking
  todayWork: string;
  todayDate: string;
  currentInstallment: string;
  workStatus: string;
  
  // Installments (Multiple)
  installments: InstallmentData[];
}

export type ViewState = 'DASHBOARD' | 'LIST' | 'ADD' | 'EDIT' | 'LETTERS';
