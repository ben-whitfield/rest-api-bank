The Scenario - Continuous Know your customer

As a company, we are required to assess our customers and understand how they run their business, known as Know Your Customer (KYC). This continuous due diligence is a regulatory requirement for all banks. Once we bring a new customer into Barclays, we collect various details such as names, registered addresses, Companies House information, etc. We are required to continuously monitor these details and reach out when there are significant
changes.

This process needs to be fully automated to ensure continuous checking of customers, with manual intervention only when necessary. When manual intervention is required, the architecture should be able to flag to our CRM to speak to the customer (assume this to be a simple API call to remove complexity).

Assumptions
Customers already exist, so your system design should not care about the initial onboarding of the system.
This process does not have to be realtime, it could well be run daily initially but build into near realtime cadence eventually.

Data Sources
You have an available database with the transactions per customer. This will be a very large database: 1m customers transaction 100 times a day on
average.
You will have to consider receiving files from external partners (ie Experian, Equifax) with information about customers - ie Company director has changed.

Triggers
You will have transaction based triggers and trend based triggers.
Example of transaction based triggers is a customer sends money to a sanctioned country (ie Cuba, Iran).
Example of trend based triggers is a customer that normally does not send more than £100 a day on average sends 2 transactions worth £5k
each.
You will have triggers for changes in the company. Example of this could be company adding new Directors or removing existing ones.

Non-Functional Requirements
Communication with Data Sources:You can have direct database calls, external webhooks, and files dropped on S3 recurrently. The
architecture should account for these different communication methods.
Resilience and Scalability:The architecture should be resilient and scale with growing needs.
Observability:Factor in observability throughout the design to monitor system performance and health.
Data Privacy and Compliance:Ensure compliance with data privacy regulations such as GDPR, including secure data storage, processing, and
transmission.

Performance and Latency:Consider performance requirements, especially latency for real-time data processing and rule evaluation.

Maintainability:Design the system to be easily maintainable, with modular components that can be updated independently.
Auditability:We should be able to audit when decisions are made in the system - ie if we decide to internally resolve something we should track
why.