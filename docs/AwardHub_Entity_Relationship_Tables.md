# AwardHub — Entity, Attribute & Relationship Tables (Markdown)

## Entity & Attribute Design

| Entity | Attribute | Type / Key / FK Notes |
|---|---|---|
| **User** (Superclass) | userID | PK |
| | email | |
| | password | |
| | contactNumber | |
| | registrationDate | |
| | accountStatus | |
| **Nominee** (Subclass of User) | nomineeID | PK, FK → User |
| | nicPassport | |
| | dateOfBirth | |
| | gender | |
| | address | Composite (street, city, state, zip) |
| | organization | |
| | jobTitle | |
| | education | Multivalued |
| | achievements | Multivalued |
| | references | Multivalued |
| | biography | |
| **Voter** (Subclass of User) | voterID | PK, FK → User |
| | nic | |
| | activationStatus | |
| **Judge** (Subclass of User) | judgeID | PK, FK → User |
| | areaOfExpertise | |
| **AwardOrganizer** (Subclass of User) | organizerID | PK, FK → User |
| | position | |
| **SystemAdministrator** (Subclass of User) | adminID | PK, FK → User |
| | accessLevel | |
| **AwardCategory** | categoryID | PK |
| | categoryName | |
| | eligibilityCriteria | |
| | nominationDeadline | |
| | votingPeriod | Composite (startDate, endDate) |
| | evaluationMethod | |
| | votingWeightage | |
| | judgingWeightage | |
| | maxVotesPerVoter | |
| | requiredDocumentTypes | Multivalued |
| **Nomination** | nominationID | PK |
| | nomineeID | FK → Nominee |
| | categoryID | FK → AwardCategory |
| | title | |
| | achievementDescription | |
| | evidenceDetails | |
| | declaration | |
| | submissionDate | |
| | status | |
| | reviewDate | |
| | rejectionReason | |
| **Document** (Weak Entity) | documentType | Partial Key |
| | nominationID | FK → Nomination (Owner / Identifying Key) |
| | fileFormat | |
| | size | |
| | uploadDate | |
| | verificationStatus | |
| **Vote** (Associative Entity) | voteID | PK |
| | voterID | FK → Voter |
| | nomineeID | FK → Nominee |
| | categoryID | FK → AwardCategory |
| | voteTimestamp | |
| | status | |
| **Evaluation** (Associative Entity) | evaluationID | PK |
| | judgeID | FK → Judge |
| | nominationID | FK → Nomination |
| | submissionDate | |
| | comments | |
| **EvaluationCriterion** | criterionID | PK |
| | categoryID | FK → AwardCategory |
| | name | |
| | scoreRange | |
| | weight | |
| **EvaluationScore** (Associative Entity) | evaluationID | PK, FK → Evaluation |
| | criterionID | PK, FK → EvaluationCriterion |
| | score | |
| | comment | |
| **Result** | resultID | PK |
| | nominationID | FK → Nomination |
| | categoryID | FK → AwardCategory |
| | totalScore | Derived |
| | ranking | |
| | winnerFlag | |
| | publicationDate | |
| **Report** | reportID | PK |
| | organizerID | FK → AwardOrganizer |
| | timestamp | |
| | content | |
| **Notification** | notificationID | PK |
| | userID | FK → User |
| | timestamp | |
| | message | |
| | status | |
| **AuditLog** | logID | PK |
| | adminID | FK → SystemAdministrator |
| | timestamp | |
| | actionType | |
| **Feedback** | feedbackID | PK |
| | userID | FK → User |
| | content | |
| | submissionDate | |
| | status | |
| | reviewedBy | FK → AwardOrganizer (nullable) |

## Relationships & Cardinalities

| Entity 1 | Relationship | Cardinality | Entity 2 | Notes |
|---|---|---|---|---|
| User | ISA | Specialization | Nominee | Disjoint, Total |
| User | ISA | Specialization | Voter | Disjoint, Total |
| User | ISA | Specialization | Judge | Disjoint, Total |
| User | ISA | Specialization | AwardOrganizer | Disjoint, Total |
| User | ISA | Specialization | SystemAdministrator | Disjoint, Total |
| Nominee | Submits | 1:N | Nomination | |
| AwardCategory | Categorizes | 1:N | Nomination | |
| Nomination | Has | 1:N | Document | Identifying relationship (weak entity) |
| Voter | Casts | 1:N | Vote | |
| Nominee | Receives | 1:N | Vote | |
| AwardCategory | Scopes | 1:N | Vote | |
| Judge | Submits | 1:N | Evaluation | |
| Nomination | Evaluated by | 1:N | Evaluation | |
| Evaluation | Has | 1:N | EvaluationScore | |
| EvaluationCriterion | Rated via | 1:N | EvaluationScore | |
| AwardCategory | Defines | 1:N | EvaluationCriterion | |
| Nomination | Yields | 1:1 | Result | |
| AwardCategory | Ranks | 1:N | Result | |
| Aggregation: Voting Process (Voter–Vote–Nomination) | Calculates | 1:N | Result | Aggregated relationship |
| Aggregation: Evaluation Process (Judge–Evaluation–Nomination) | Calculates | 1:N | Result | Aggregated relationship |
| SystemAdministrator | Views | 1:N | AuditLog | |
| User | Receives | 1:N | Notification | |
| User | Submits | 1:N | Feedback | |
| AwardOrganizer | Generates | 1:N | Report | |
| AwardOrganizer | Reviews | 1:N | Feedback | |
