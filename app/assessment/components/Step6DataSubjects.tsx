import React from "react";
import MultiSelectField from "./MultiSelectField";
export interface Step6DataSubjectsProps { businessTypeId:string; selectedFields:string[]; collectorRoles:string[]; dataSubjectTypes:string[]; collectionFormats:string[]; storageLocations:string[]; storageEnvironments:string[]; encryptionStatuses:string[]; accessRoles:string[]; sharingStatuses:string[]; retentionPeriods:string[]; deletionMethods:string[]; privacyNotices:string[]; consentStatuses:string[]; parentalConsentStatuses:string[]; crossBorderTransfers:string[]; setCollectorRoles:(v:any)=>void; setDataSubjectTypes:(v:any)=>void; setCollectionFormats:(v:any)=>void; setStorageLocations:(v:any)=>void; setStorageEnvironments:(v:any)=>void; setEncryptionStatuses:(v:any)=>void; setAccessRoles:(v:any)=>void; setSharingStatuses:(v:any)=>void; setRetentionPeriods:(v:any)=>void; setDeletionMethods:(v:any)=>void; setPrivacyNotices:(v:any)=>void; setConsentStatuses:(v:any)=>void; setParentalConsentStatuses:(v:any)=>void; setCrossBorderTransfers:(v:any)=>void; toggleArrayValue:(value:string,setter:any)=>void; }
const cardStyle={background:"white",border:"1px solid #e2e8f0",borderRadius:"14px",padding:"28px",marginBottom:"20px"}; const headingStyle={color:"#0f172a",marginTop:0,marginBottom:"18px"}; const noticeStyle={color:"#64748b",lineHeight:1.6}; const StepNumber=({number}:{number:string})=><div style={{width:"34px",height:"34px",borderRadius:"50%",background:"#1d4ed8",color:"white",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,marginBottom:"16px"}}>{number}</div>;
export default function Step6DataSubjects({businessTypeId,selectedFields,collectorRoles,dataSubjectTypes,collectionFormats,storageLocations,storageEnvironments,encryptionStatuses,accessRoles,sharingStatuses,retentionPeriods,deletionMethods,privacyNotices,consentStatuses,parentalConsentStatuses,crossBorderTransfers,toggleArrayValue,setCollectorRoles,setDataSubjectTypes,setCollectionFormats,setStorageLocations,setStorageEnvironments,setEncryptionStatuses,setAccessRoles,setSharingStatuses,setRetentionPeriods,setDeletionMethods,setPrivacyNotices,setConsentStatuses,setParentalConsentStatuses,setCrossBorderTransfers}:Step6DataSubjectsProps){ return (
<>


        {businessTypeId ===
          "EDU-SCH" &&
          selectedFields.length >
            0 && (
            <section
              style={cardStyle}
            >
              <StepNumber number="6" />

              <h2
                style={headingStyle}
              >
                How is this personal data
                collected and handled?
              </h2>

              <p
                style={{
                  ...noticeStyle,
                  marginBottom:
                    "24px",
                }}
              >
                Select all options that
                apply. Real-world
                processes often use
                multiple people, channels
                and storage locations.
              </p>

              <MultiSelectField
                label="Who collects this data?"
                values={
                  collectorRoles
                }
                options={[
                  "Admissions Executive",
                  "Teacher",
                  "Class Teacher",
                  "Administrative Staff",
                  "Accounts Staff",
                  "HR / HR Administrator",
                  "IT / System Administrator",
                  "Principal / Management",
                  "Reception / Front Desk",
                  "Third-party Service Provider",
                  "Other",
                ]}
                onToggle={(value) =>
                  toggleArrayValue(
                    value,
                    setCollectorRoles
                  )
                }
              />

              <MultiSelectField
                label="Who is the data subject?"
                values={
                  dataSubjectTypes
                }
                options={[
                  "Student",
                  "Parent / Guardian",
                  "Employee",
                  "Teacher",
                  "Visitor",
                  "Vendor / Service Provider",
                  "Other",
                ]}
                onToggle={(value) =>
                  toggleArrayValue(
                    value,
                    setDataSubjectTypes
                  )
                }
              />

              <MultiSelectField
                label="How is the data collected?"
                values={
                  collectionFormats
                }
                options={[
                  "Website Form",
                  "Google Form",
                  "Mobile / School App",
                  "WhatsApp",
                  "Email",
                  "Telephone",
                  "Paper / Physical Form",
                  "In Person / Verbal",
                  "Excel / Spreadsheet",
                  "Other",
                ]}
                onToggle={(value) =>
                  toggleArrayValue(
                    value,
                    setCollectionFormats
                  )
                }
              />

              <MultiSelectField
                label="Where is the data stored?"
                values={
                  storageLocations
                }
                options={[
                  "School Management System",
                  "Student Information System",
                  "CRM",
                  "Google Drive",
                  "Microsoft 365 / SharePoint",
                  "Excel / Spreadsheet",
                  "Email Mailbox",
                  "WhatsApp Account",
                  "Local Computer",
                  "Paper File / Physical Record",
                  "Third-party Vendor System",
                  "Other",
                  "Unknown",
                ]}
                onToggle={(value) =>
                  toggleArrayValue(
                    value,
                    setStorageLocations
                  )
                }
              />

              <MultiSelectField
                label="Where is the storage environment?"
                values={
                  storageEnvironments
                }
                options={[
                  "Cloud",
                  "On-Premises",
                  "Employee Device",
                  "Mobile Device",
                  "Physical Storage",
                  "Third-party Hosted",
                  "Unknown",
                ]}
                onToggle={(value) =>
                  toggleArrayValue(
                    value,
                    setStorageEnvironments
                  )
                }
              />

              <MultiSelectField
                label="How is the stored data protected?"
                values={
                  encryptionStatuses
                }
                options={[
                  "Encrypted at rest and in transit",
                  "Encrypted at rest only",
                  "Encrypted in transit only",
                  "Clear text / Not encrypted",
                  "Unknown",
                ]}
                onToggle={(value) =>
                  toggleArrayValue(
                    value,
                    setEncryptionStatuses
                  )
                }
              />

              <MultiSelectField
                label="Who can access the data?"
                values={
                  accessRoles
                }
                options={[
                  "Admissions Executive",
                  "Teacher",
                  "Class Teacher",
                  "Administrative Staff",
                  "Accounts Staff",
                  "HR / HR Administrator",
                  "IT / System Administrator",
                  "Principal / Management",
                  "Reception / Front Desk",
                  "Third-party Service Provider",
                  "Other",
                ]}
                onToggle={(value) =>
                  toggleArrayValue(
                    value,
                    setAccessRoles
                  )
                }
              />

              <MultiSelectField
                label="Is the data shared with anyone else?"
                values={
                  sharingStatuses
                }
                options={[
                  "No external sharing",
                  "Shared internally only",
                  "Shared with service provider",
                  "Shared with multiple third parties",
                  "Unknown",
                ]}
                onToggle={(value) =>
                  toggleArrayValue(
                    value,
                    setSharingStatuses
                  )
                }
              />

              <MultiSelectField
                label="How long is the data retained?"
                values={
                  retentionPeriods
                }
                options={[
                  "Less than 30 days",
                  "30 days – 1 year",
                  "1 – 3 years",
                  "3 – 5 years",
                  "More than 5 years",
                  "Indefinitely",
                  "No defined retention period",
                  "Unknown",
                ]}
                onToggle={(value) =>
                  toggleArrayValue(
                    value,
                    setRetentionPeriods
                  )
                }
              />

              <MultiSelectField
                label="How is the data deleted?"
                values={
                  deletionMethods
                }
                options={[
                  "Automatic deletion",
                  "Manual deletion",
                  "Periodic review and deletion",
                  "On request",
                  "No defined deletion process",
                  "Unknown",
                ]}
                onToggle={(value) =>
                  toggleArrayValue(
                    value,
                    setDeletionMethods
                  )
                }
              />

              <MultiSelectField
                label="Is a privacy notice provided?"
                values={
                  privacyNotices
                }
                options={[
                  "Yes",
                  "No",
                  "Partially",
                  "Unknown",
                ]}
                onToggle={(value) =>
                  toggleArrayValue(
                    value,
                    setPrivacyNotices
                  )
                }
              />

              <MultiSelectField
                label="Is consent obtained where required?"
                values={
                  consentStatuses
                }
                options={[
                  "Yes",
                  "No",
                  "Partially",
                  "Not applicable / Other lawful basis",
                  "Unknown",
                ]}
                onToggle={(value) =>
                  toggleArrayValue(
                    value,
                    setConsentStatuses
                  )
                }
              />

              <MultiSelectField
                label="For minors, is parent / guardian involvement addressed?"
                values={
                  parentalConsentStatuses
                }
                options={[
                  "Yes",
                  "No",
                  "Partially",
                  "Not applicable",
                  "Unknown",
                ]}
                onToggle={(value) =>
                  toggleArrayValue(
                    value,
                    setParentalConsentStatuses
                  )
                }
              />

              <MultiSelectField
                label="Is the data transferred outside India?"
                values={
                  crossBorderTransfers
                }
                options={[
                  "No",
                  "Yes",
                  "Unknown",
                ]}
                onToggle={(value) =>
                  toggleArrayValue(
                    value,
                    setCrossBorderTransfers
                  )
                }
              />

              <div
                style={{
                  marginTop: "28px",
                  padding: "16px",
                  background:
                    "#f8fafc",
                  border:
                    "1px solid #e2e8f0",
                  borderRadius: "10px",
                  color: "#475569",
                  lineHeight: 1.6,
                }}
              >
                <strong>
                  Assessment guidance:
                </strong>{" "}
                Select all options that
                apply. If you don't know
                the answer, select{" "}
                <strong>
                  Unknown
                </strong>
                .
              </div>
            </section>
          )}
</>
);
}
