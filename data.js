var events = require("./store").events,
	pages = require("./store").pages,
	map = require("lodash/collection/map"),
	reduce = require("lodash/collection/reduce"),
	// For dev purposes only
	// ------
	data = {
		"d": {
			"results": [
				{
					"__metadata": {
						"id": "Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(1)",
						"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(1)",
						"etag": "\"21\"",
						"type": "SP.Data.ContentListItem"
					},
					"FirstUniqueAncestorSecurableObject": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(1)/FirstUniqueAncestorSecurableObject"
						}
					},
					"RoleAssignments": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(1)/RoleAssignments"
						}
					},
					"AttachmentFiles": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(1)/AttachmentFiles"
						}
					},
					"ContentType": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(1)/ContentType"
						}
					},
					"FieldValuesAsHtml": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(1)/FieldValuesAsHtml"
						}
					},
					"FieldValuesAsText": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(1)/FieldValuesAsText"
						}
					},
					"FieldValuesForEdit": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(1)/FieldValuesForEdit"
						}
					},
					"File": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(1)/File"
						}
					},
					"Folder": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(1)/Folder"
						}
					},
					"ParentList": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(1)/ParentList"
						}
					},
					"FileSystemObjectType": 0,
					"Id": 1,
					"Title": "Travel Medicine",
					"Icon": "map-2",
					"Section": "FH",
					"Program": "TravelMedicine",
					"Page": null,
					"rabbitHole": null,
					"Keywords": {
						"__metadata": {
							"type": "Collection(SP.Taxonomy.TaxonomyFieldValue)"
						},
						"results": [
							{
								"Label": "travel",
								"TermGuid": "28715891-b72d-433d-a899-ed5e7eb300fa",
								"WssId": 1267
							},
							{
								"Label": "medicine",
								"TermGuid": "e19b1f54-9324-4a49-8dcc-1d8206fcca7e",
								"WssId": 1268
							},
							{
								"Label": "overseas",
								"TermGuid": "a7463e4a-ade8-43a9-9792-1fec44ec560f",
								"WssId": 1269
							},
							{
								"Label": "foreign",
								"TermGuid": "0e0e029f-b8de-4944-8540-1b5471669b7a",
								"WssId": 1270
							}
						]
					},
					"References": {
						"__metadata": {
							"type": "Collection(SP.Taxonomy.TaxonomyFieldValue)"
						},
						"results": []
					},
					"Overview": "Travel medicine focuses on prevention and management of health problems of international travelers. Globalization facilitates the spread of disease and increases the number of travelers who will be exposed to a different health environment. Major content areas of travel medicine include the global epidemiology of health risks to the traveler, vaccinology, malaria prevention, and pre-travel counseling designed to maintain the health of our beneficiary population. \n\n\n- From the **2013 Accreditation Handbook - AAAHC**, chapter 15, sub-chapter II — \"Travel Medicine\"\n  > This subchapter applies only to organizations that provide travel medicine services.\n  >\n  > Organizations providing travel medicine services will ensure that these services are appropriate to the needs of the patient and are adequately supported by the organization’s clinical capabilities.\n  >\n  > 1. Travel medicine services are provided by personnel who have appropriate training, skills, and resource materials to provide quality services.\n  > 2. Travel medicine programs include:\n  >    - Appropriate medical oversight.\n  >    - Clearly defined standing orders and protocols, including management of adverse reactions to immunizations.\n  >    - Access to current Centers for Disease Control (CDC) and U.S. Department of State travel recommendations.\n  >    - Appropriate storage and management of vaccines.\n  > 3. Travel medicine services include:\n  >    - Comprehensive travel destination-specific risk assessment.\n  >    - Appropriate preventive medicine interventions.\n  >    - Education in risk and risk reduction.\n  > 4. Entries in a patient’s clinical record include:\n  >    - Travel destination and current health status.\n  >    - Immunization and vaccine name(s), dosage form, dosage administered, lot number, and quantity.\n  >    - Prescription medications given, quantity and date, dosage, and directions for use.\n  >    - Preventive health education.",
					"Policy": null,
					"Training": null,
					"Resources": "### Federal and DoD:\n- [World Fact Book (CIA)](https://www.cia.gov/library/publications/the-world-factbook/index.html)\n- [NCMI – National Center for Medical Intelligence (DIA)](https://www.intelink.gov/ncmi/index.php)\n- [U.S. Department of State – Travel Information](http://travel.state.gov/)\n- [DoD Foreign Clearance Guide](https://www.fcg.pentagon.mil/)\n\n### CDC:\n- [CDC Yellow Book and Blue Sheet](http://www.cdc.gov/travel/reference.htm) (Health Information for International Travel)\n- [CDC Traveler’s Health Section](http://www.cdc.gov/travel/) (General Info for the Public)\n\n### WHO:\n- [WHO International Travel and Health Publications](http://www.who.int/ith/)\n- [WHO Health Topics](http://www.who.int/topics/en/)\n\n### Commercial:\n- [Travel Health Online](http://www.tripprep.com/) (Good, concise, well organized source)\n- [Travel Medicine](http://www.travmed.com/) (commercial site)\n- [Military.com Travel Center](http://www.military.com/Travel/Content1/0%2c%2cNew-Travel-Restrictions%2c00.html)\n- [TRAVAX®](https://kx.afms.mil/kj/kx8/VirtualLibrary/Pages/home.aspx) (No Login Link) Select Travax Encompass from the Virtual Library",
					"Tools": null,
					"Contributions": null,
					"ContentTypeId": "0x0100B2D3D6C931BB534D9AF1CB0299E7F31B",
					"Link": null,
					"ID": 1,
					"Modified": "2015-09-19T06:35:25Z",
					"Created": "2015-07-16T23:41:26Z",
					"AuthorId": 5989,
					"EditorId": 5989,
					"OData__UIVersionString": "4.0",
					"Attachments": false,
					"GUID": "439fea1c-fa16-4b2b-afe0-8a353b7073c9"
				},
				{
					"__metadata": {
						"id": "Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(2)",
						"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(2)",
						"etag": "\"40\"",
						"type": "SP.Data.ContentListItem"
					},
					"FirstUniqueAncestorSecurableObject": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(2)/FirstUniqueAncestorSecurableObject"
						}
					},
					"RoleAssignments": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(2)/RoleAssignments"
						}
					},
					"AttachmentFiles": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(2)/AttachmentFiles"
						}
					},
					"ContentType": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(2)/ContentType"
						}
					},
					"FieldValuesAsHtml": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(2)/FieldValuesAsHtml"
						}
					},
					"FieldValuesAsText": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(2)/FieldValuesAsText"
						}
					},
					"FieldValuesForEdit": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(2)/FieldValuesForEdit"
						}
					},
					"File": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(2)/File"
						}
					},
					"Folder": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(2)/Folder"
						}
					},
					"ParentList": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(2)/ParentList"
						}
					},
					"FileSystemObjectType": 0,
					"Id": 2,
					"Title": "Preventive Health Assessment",
					"Icon": "note2",
					"Section": "FH",
					"Program": "PHA",
					"Page": null,
					"rabbitHole": null,
					"Keywords": {
						"__metadata": {
							"type": "Collection(SP.Taxonomy.TaxonomyFieldValue)"
						},
						"results": [
							{
								"Label": "pha",
								"TermGuid": "85fcddcb-003c-49c1-9034-db284fd6fcc5",
								"WssId": 1271
							},
							{
								"Label": "imr",
								"TermGuid": "bf9f5928-b319-4294-99b1-8a6d16c6ab19",
								"WssId": 1272
							},
							{
								"Label": "readiness",
								"TermGuid": "a91e06cf-2b70-43c1-9dbe-be67991c67b7",
								"WssId": 1273
							}
						]
					},
					"References": {
						"__metadata": {
							"type": "Collection(SP.Taxonomy.TaxonomyFieldValue)"
						},
						"results": [
							{
								"Label": "afi44-170",
								"TermGuid": "4631277f-fb55-4698-a1d4-b828f22f7a1c",
								"WssId": 1274
							},
							{
								"Label": "afi48-123",
								"TermGuid": "eba561a9-3e52-4b17-b938-b9c04cc922fd",
								"WssId": 1275
							},
							{
								"Label": "afi41-210",
								"TermGuid": "d1e84369-ee2d-4deb-bf9e-c75f3dc88b78",
								"WssId": 1276
							},
							{
								"Label": "afi10-203",
								"TermGuid": "013504cd-0a3a-4dd5-9eb0-5446f46b0dbb",
								"WssId": 1277
							},
							{
								"Label": "afi10-250",
								"TermGuid": "6014a1b1-a536-4c68-a0e9-1de6e4818122",
								"WssId": 1278
							}
						]
					},
					"Overview": "> This page is continuously revised and updated.  If you have documents, spreadsheets, examples, etc., which you believe should be included here, please send them to MSgt Timothy Kronk, AFMOA/SGPM (timothy.kronk@us.af.mil).  We welcome your feedback.  Together, we can make this a more useful product for the AFMS. Thanks.\n\n---\n\n*Last updated: 29 May 2015*",
					"Policy": "[AFI 44-170](http://static.e-publishing.af.mil/production/1/af_sg/publication/afi44-170/afi44-170.pdf), *Preventive Health Assessments*\n\n[AFI 41-210](http://static.e-publishing.af.mil/production/1/af_sg/publication/afi41-210/afi41-210.pdf), *Tricare Operations and Patient Administration Functions*\n\n[AFI 48-123](http://static.e-publishing.af.mil/production/1/af_sg/publication/afi48-123/afi48-123.pdf), *Medical Examinations and Standards*\n\n[AFI 10-250](http://static.e-publishing.af.mil/production/1/af_sg/publication/afi10-250/afi10-250.pdf), *Individual Medical Readiness*\n\n[AFI 10-203](http://static.e-publishing.af.mil/production/1/af_sg/publication/afi10-203/afi10-203.pdf), *Duty Limiting Conditions*",
					"Training": null,
					"Resources": "### Sister Service PHA Websites\n\n[U.S. Army](https://medpros.mods.army.mil/pha/login.aspx)\n\n[U.S. Navy / Marine Corps](http://www.med.navy.mil/sites/nmcphc/health-promotion/Pages/periodic-health-assessment.aspx)\n\n[U.S. Coast Guard](http://www.uscg.mil/hq/cg1/cg112/cg1121/PHA_med.asp)",
					"Tools": "### Before\n\n[CPS Recommendations](http://epss.ahrq.gov/ePSS/search.jsp)\n\n- [The Guide to Clinical Preventive Services, 2014](https://kx.afms.mil/kj/kx1/PHA/Documents/The%20Guide%20to%20Clinical%20Preventive%20Services%202014.pdf)\n  - Includes U.S. Preventive Services Task Force (USPSTF) recommendations on screening, counselling, and preventive medication topics and includes clinical considerations for each topic. This new pocket guide provides general practitioners, internists, family practitioners, paediatricians, nurses, and nurse practitioners with an authoritative source for making decisions about preventive services.\n\n- [Tools for implementing USPSTF recommendations](http://epss.ahrq.gov/ePSS/Tools.do)\n  - AFMOA-approved patient education and supplemental information can be found on the AHRQ website.\n\n[Air Force Web-Based Health Assessment (AF Web HA)](https://afwebha.afms.mil/) - starting point for gathering reports and identifying critical, priority, and routine health risk assessment findings.\n\n- [Setting Up the AF Web HA](https://kx.afms.mil/kj/kx1/PHA/Setting%20Up%20the%20AF%20WEB%20HA%20-%20v2014.02.25.pdf) *25 Feb 2014*\n  - Guidance and help with setting up the AF Web HA, including how to grant access to the AF Web HA.\n\n- [ASIMS AF Web HA Medical Users: User Guide](https://kx.afms.mil/kj/kx1/PHA/ASIMS_WebHA_Medical_Users_Guide.pdf) *6 Oct 2014*\n  - Tool to facilitate clinical, personal and population-based health decisions.\n\n- [SF507](https://kx.afms.mil/kj/kx1/PHA/Documents/SF507.pdf), *Health History Questions/Interval History*\n  - To be used if the AF Web HA is unavailable.\n\n- [How-To - AHLTA \"High Priority T-CON\"](https://kx.afms.mil/kj/kx1/PHA/AHLTA%20T-CON%20Procedure%20for%20Critical%20or%20Priority%20PHA%20-%20HOW%20TO.xfdl) *(courtesy of JBER PH)*\n  - Lotus Forms document outlining the procedures for members indicating a Critical or Priority finding on their AF Web HA.\n\n\n### During\n\n[PHA-FOME User Guide - v1.2](https://kx.afms.mil/kj/kx1/PHA/Documents/2015%20PHA-FOME%20User%20Guide%20-%20v1%2020_Published.pdf) *14 Jan 2015*\n- Standardized guide for executing non-fly/non-SOD Preventive Health Assessments and the PHA portion of the fly/SOD during the Flight & Operational Medicine Exam (FOME), IAW AFI 44-170.\n\n[The Alcohol Use Disorders Identification Test (AUDIT)](https://kx.afms.mil/kxweb/dotmil/file/web/ctb_220595.pdf)\n- Written primarily for health care practitioners who encounter persons with alcohol-related problems. It is designed to be used in conjunction with a companion document that provides complementary information about early intervention procedures entitled, *[\"Brief Intervention for Hazardous and Harmful Drinking: A Manual for Use in Primary Care\"](http://whqlibdoc.who.int/hq/2001/WHO_MSD_MSB_01.6b.pdf)*. Together these manuals describe a comprehensive approach to screening and brief intervention for alcohol-related problems in primary health care.\n\n[Patient Health Questionnaire (PHQ-9)](http://phqscreeners.com/pdfs/02_PHQ-9/English.pdf)\n- Powerful tool for assisting primary care clinicians in diagnosing depression as well as selecting and monitoring treatment. In addition to the depression questions on the AF Web HA, and the member's responses to those questions, the PHQ-9 is the AFMOA approved questionnaire if further assessment is indicated.  PCM Team should discuss with the patient the reasons for completing the questionnaire and how to fill it out. After the patient has completed the PHQ-9 questionnaire, it is scored by the PCM Team.\n\n[Framingham CHD Risk Calculator (CRAM Score)](http://cvdrisk.nhlbi.nih.gov/calculator.asp)\n\n - [Coronary Heart Disease Risk Assessment and Management Mini Clinical Practice Guidelines and Tool Kit](https://kx.afms.mil/kj/kx8/CRAM/Pages/home.aspx)\n   - Collection of several reference documents, educational handouts, and documentation tools intended to assist providers in managing the cardiac risks of their patient population.\n\n### After\n\n[PHA Cell Technician-Level Peer Review v1.01](https://kx.afms.mil/kj/kx1/PHA/PHA%20Cell%20Technician-Level%20Peer%20Review%20v1.01.xlsx) *29 Apr 2014*\n- Standardized check-list for the PHA Cell technician-level peer review.\n\n[PHA Provider Peer Review](https://kx.afms.mil/kj/kx1/PHA/PHA%20Provider%20Peer%20Review%20v1.00.xlsx)\n- Standardized check-list for PCM team providers to conduct clinical peer review on other providers.\n\n### Mental Health Guidance\n\n[AF Web HA - Key Mental Health Screening Tools](https://kx.afms.mil/kj/kx1/PHA/Mental%20Health%20Assessments%20%28AF%20WebHA%29%20-%2022%20Jan%2015v2.pptx) *22 Jan 2015*\n- Succinct PowerPoint slideshow to familiarize non-Mental Health providers with the key mental health screening tools contained within the AF Web HA.\n\n[Prevention Counselling Desktop Assistant](https://kx.afms.mil/kj/kx1/PHA/Prevention%20Counseling%20Desktop%20Assistant.pdf)\n\n[Factors that Affect Behaviour Change](https://kx.afms.mil/kj/kx1/PHA/Factors%20that%20affect%20Behavior%20Change.pdf)\n\n[Stages of Change](https://kx.afms.mil/kj/kx1/PHA/Stages%20of%20Change.pdf)\n\n### Unit IMR Guidance\n\n[Commander Designee Letter for HIPAA Protected Health Information and ASIMS Access](https://kx.afms.mil/kj/kx1/PHA/CC%20Designee%20ltr%20with%20ASIMS%20attachment%20-%205%20Mar%2015.docx) *5 Mar 2015*\n- This template is intended to provide a standardized method for commanders to designate POC(s) to receive PHI on their behalf.  The completed letter will specify which type of access each designee should be granted.  Additional PH and HPO guidance is provided [here](https://kx.afms.mil/kj/kx1/PHA/Commander%20Designee%20Letter%20Template%20Guidance%2021%20May%2014.docx).\n- If you currently have appointment letters on file, units do not need to re-accomplish with the new template unless the previous letter is no longer valid because it is older than one year or is not signed by the current commander.\n- Approved by AFMOA/SGAT for use on 21 May 2014, and revised on 5 Mar 2015.\n\n[ASIMS Unit POC Module - Access to IMR Reports](https://kx.afms.mil/kj/kx1/PHA/SiteAssets/Pages/toolbox/ASIMS%20Unit%20POC%20Module%20-%20Access%20to%20IMR%20Reports%20-%20v2014.02.18.pdf) *18 Feb 2014*\n- Guide for setting up the ASIMS Unit POC List and helping those users navigate ASIMS to identify members with due/overdue IMR, PHA, and DRHA requirements.\n\n[Unit Commander's Guide To ASIMS](https://kx.afms.mil/kj/kx7/PublicHealth/Documents/Unit%20Commander%20Guide%20To%20ASIMS_2014%2010%2001.pub)\n- Customizable pamphlet intended to educate Unit/CCs on IMR, DRHAs, DLCs, Profiles, and Refer to DAWG within ASIMS.\n\n[UHM Quick Guide](https://kx.afms.mil/kj/kx1/PHA/UHM%20Quick%20Guide%20v1.0.pptx) *(courtesy of JBER PH)*\n- Slideshow which can be customized for your base and sent to UHMs.  Details how to access the Personnel List in the ASIMS Unit POC module, identify action list items and notify their personnel.\n\n\n### Miscellaneous\n\n\n[Body Mass Index (BMI) Calculator](http://www.nhlbi.nih.gov/guidelines/obesity/BMI/bmicalc.htm)\n\n[G6PD Over Print](https://kx.afms.mil/kj/kx1/PHA/G6PD%20Over%20Print%202012.doc)\n- Standardized means of documenting in a member's Outpatient Record his or her education regarding G6PD deficiency.\n\n[G6PD Service Member Handout](https://kx.afms.mil/kj/kx1/PHA/G6PG_Service_Member_Handout.pdf)\n- Patient education handout for members with positive G6PD deficiency.",
					"Contributions": null,
					"ContentTypeId": "0x0100B2D3D6C931BB534D9AF1CB0299E7F31B",
					"Link": null,
					"ID": 2,
					"Modified": "2015-09-19T06:58:36Z",
					"Created": "2015-07-17T00:36:39Z",
					"AuthorId": 5989,
					"EditorId": 5989,
					"OData__UIVersionString": "3.0",
					"Attachments": false,
					"GUID": "f7a4d307-8bdc-46b0-a91d-1d1a4360910c"
				},
				{
					"__metadata": {
						"id": "Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(3)",
						"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(3)",
						"etag": "\"14\"",
						"type": "SP.Data.ContentListItem"
					},
					"FirstUniqueAncestorSecurableObject": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(3)/FirstUniqueAncestorSecurableObject"
						}
					},
					"RoleAssignments": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(3)/RoleAssignments"
						}
					},
					"AttachmentFiles": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(3)/AttachmentFiles"
						}
					},
					"ContentType": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(3)/ContentType"
						}
					},
					"FieldValuesAsHtml": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(3)/FieldValuesAsHtml"
						}
					},
					"FieldValuesAsText": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(3)/FieldValuesAsText"
						}
					},
					"FieldValuesForEdit": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(3)/FieldValuesForEdit"
						}
					},
					"File": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(3)/File"
						}
					},
					"Folder": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(3)/Folder"
						}
					},
					"ParentList": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(3)/ParentList"
						}
					},
					"FileSystemObjectType": 0,
					"Id": 3,
					"Title": "Disease Surveillance & Epidemiology",
					"Icon": "science",
					"Section": "Comm",
					"Program": "Epi",
					"Page": null,
					"rabbitHole": null,
					"Keywords": {
						"__metadata": {
							"type": "Collection(SP.Taxonomy.TaxonomyFieldValue)"
						},
						"results": []
					},
					"References": {
						"__metadata": {
							"type": "Collection(SP.Taxonomy.TaxonomyFieldValue)"
						},
						"results": [
							{
								"Label": "afi10-2603",
								"TermGuid": "e2db2890-e97d-4bfc-a9a5-00105f2c9f95",
								"WssId": 1279
							},
							{
								"Label": "afi44-102",
								"TermGuid": "a8582741-1ca2-4538-9076-ee63d39c3104",
								"WssId": 1280
							},
							{
								"Label": "afi48-101",
								"TermGuid": "299379e8-0d0f-45fe-b752-45bb933d4156",
								"WssId": 1281
							},
							{
								"Label": "afi48-105",
								"TermGuid": "56752e56-6b10-4633-befc-b0522d68994f",
								"WssId": 1282
							}
						]
					},
					"Overview": "Air Force Disease Surveillance and Epidemiology programs are community health programs.  Public Health activities monitor disease and injury incidence to identify departure from background, or not \"normal,\" rates.  When outbreaks of disease or clusters of injury are identified, public health functions to investigate these occurrences, identify risk factors, and implement effective interventions.  Surveillance and epidemiology also function to inform, evaluate and validate outcomes of public health policy.",
					"Policy": "AFI 10-2519, *Emergency Health Powers on Air Force Installations*\n\nAFI 44-102, *Medical Care Management*\n\nAFI 48-101, *Aerospace Medicine Enterprise*\n\nAFI 48-105, *Surveillance, Prevention, and Control of Diseases and Conditions of Public Health or Military Significance*\n\n[AFMOA/CC Memorandum](/kj/kx7/PublicHealth/Documents/EX%20176%20Ref%20-%20AFMOA%20CC%20Memo%20Enhanced%20Surveif%20Disease%20Assoc%20with%20Bio%20and%20Chem%20Agents%20-1%20Nov%202001.pdf), *Enhanced Surveillance of Disease Patterns Associated with Biological and Chemical Agents, 1 Nov 2001*\n\n",
					"Training": null,
					"Resources": "[Armed Forces Reportable Medical Events Guidelines and Case Definitions (2012)](https://gumbo2.wpafb.af.mil/epi-consult/reportableevents/documents/Tri-Service%20Reportable%20Events%2c%20Guidelines%20and%20Case%20Definitions%20%282012%29.pdf)\n\n[How to Report Novel Diseases (MERS-CoV) into AFRESS](https://gumbo2.wpafb.af.mil/epi-consult/documents/Novel%20disease%20reporting%20in%20AFRESS.pdf)",
					"Tools": "[Cyclospora Outbreak Reporting in AFRESS](/kj/kx7/PublicHealth/Documents/Cyclospora%20outbreak%20reporting%20in%20AFRESS.PDF)\n",
					"Contributions": null,
					"ContentTypeId": "0x0100B2D3D6C931BB534D9AF1CB0299E7F31B",
					"Link": null,
					"ID": 3,
					"Modified": "2015-09-19T06:58:11Z",
					"Created": "2015-07-29T16:00:22Z",
					"AuthorId": 5989,
					"EditorId": 5989,
					"OData__UIVersionString": "3.0",
					"Attachments": false,
					"GUID": "4f7e339a-a0d4-48b8-b709-24734695d690"
				},
				{
					"__metadata": {
						"id": "Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(4)",
						"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(4)",
						"etag": "\"12\"",
						"type": "SP.Data.ContentListItem"
					},
					"FirstUniqueAncestorSecurableObject": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(4)/FirstUniqueAncestorSecurableObject"
						}
					},
					"RoleAssignments": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(4)/RoleAssignments"
						}
					},
					"AttachmentFiles": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(4)/AttachmentFiles"
						}
					},
					"ContentType": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(4)/ContentType"
						}
					},
					"FieldValuesAsHtml": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(4)/FieldValuesAsHtml"
						}
					},
					"FieldValuesAsText": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(4)/FieldValuesAsText"
						}
					},
					"FieldValuesForEdit": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(4)/FieldValuesForEdit"
						}
					},
					"File": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(4)/File"
						}
					},
					"Folder": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(4)/Folder"
						}
					},
					"ParentList": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(4)/ParentList"
						}
					},
					"FileSystemObjectType": 0,
					"Id": 4,
					"Title": "Occupational Health",
					"Icon": "portfolio",
					"Section": "FH",
					"Program": "OccHealth",
					"Page": null,
					"rabbitHole": null,
					"Keywords": {
						"__metadata": {
							"type": "Collection(SP.Taxonomy.TaxonomyFieldValue)"
						},
						"results": [
							{
								"Label": "occupational health",
								"TermGuid": "82b886b3-dcbf-439f-8fd8-f41abe4eded3",
								"WssId": 1284
							},
							{
								"Label": "oeh",
								"TermGuid": "bcd51ccd-5602-4982-9ee9-40f662bfb2a8",
								"WssId": 1285
							},
							{
								"Label": "occ health",
								"TermGuid": "cdfc000c-ec05-47cb-a3d9-a2a2b1032407",
								"WssId": 1286
							}
						]
					},
					"References": {
						"__metadata": {
							"type": "Collection(SP.Taxonomy.TaxonomyFieldValue)"
						},
						"results": [
							{
								"Label": "afi48-101",
								"TermGuid": "299379e8-0d0f-45fe-b752-45bb933d4156",
								"WssId": 1281
							},
							{
								"Label": "afi48-145",
								"TermGuid": "5759f9e0-a7d6-4457-a66f-85dbcd690021",
								"WssId": 1291
							}
						]
					},
					"Overview": "IAW AFI 48-145, Occupational and Environmental Health Program, the purpose of the AF OEH Program is to protect health while enhancing combat and operational capabilities. The program is designed to mitigate OEH-related health risks through the optimum application of Aerospace Medicine capabilities. It seeks to identify, assess and eliminate or control health hazards associated with day-to-day operations across the full life-cycle of acquisition, sustainment and support for weapons systems, munitions and other materiel systems.\n\nThe *\"Quality and Administration\"* of OEH Medical Examinations and follow-up, is a Public Health function. Key duties include:\n\n- Serves as member of the OEHWG, providing consultation on recommended OEH MSEs, OEH training requirements, risk communication, and OEH surveillance\n\n- Manages the Occupational and Environmental Health Illness Program\n\n- Manages the Installation Fetal Protection Program\n\n- In conjunction with BE, acts as a consultant to workplace supervisors for OEH training. In coordination with BE, reviews and makes available training materials to workplace supervisors. PH will proactively offer training assistance (materials, consultation) to non-MTF workplaces with blood-borne pathogen hazards\n\n- Provides administrative oversight of MSE program as directed by the IOEMC\n\n- Acts as MTF or ARC medical unit liaison to local/community health department \n\n- When supporting an LSMTF or MAS with no PH officer assigned, oversees the OEH epidemiology and FHM aspects of the OEH Program at the GSUs or MUNSS sites. The level of involvement may range from simple oversight to performing the functions based on the technical expertise of the LSMTF or MAS personnel",
					"Policy": "[AFI 10-203](), *Duty Limiting Conditions*\n\n[AFI 44-102](), *Medical Care Management*\n\n[AFI 48-101](), *Aerospace Medicine Enterprise*\n\n[AFI 48-123](), *Medical Examinations and Standards*\n\n[AFI 48-145](), *Occupational Health Program*\n\n[AFI 90-821](), *Hazard Communication*\n\n[AFI 91-202](), *The US Air Force Mishap Prevention Program*\n\n[AFI 91-204](), *Safety Investigations and Reports*\n\n[AFMAN 48-125](), *Personnel Ionizing Radiation Dosimetry*\n\nAFOSHSTD 48-9, *Electro-Magnetic Frequency (EMF) Radiation Occupational Health Program*\n\nAFOSHSTD 48-20, *Occupational Noise and Hearing Conservation Program*\n\nAFOSHSTD 48-137, *Respiratory Protection Program*\n\nAFPD 48-1, *Aerospace Medicine Enterprise*\n\nDoDI 6055.05, *Occupational and Environmental Health, 11 Nov 2008*\n\nDoD 6055.05-M, *Occupational Medical Examinations and Surveillance Manual, IC1, 16 Sep 2008*\n\nDoDI 6055.5, *Industrial Hygiene and Occupational Health, IC1, 6 May 1996*\n\n29 CFR 1910.95 Section 8, *Occupational Noise Exposure, Follow-up Procedures, 1 Jul 2005*",
					"Training": null,
					"Resources": "- [National Fire Protection Association (NFPA) 1582](), Standard on Comprehensive Occupational Medical Program for Fire Departments, 2013 Edition \n\n- [NFPA 1582 2013 Edition]() - Technical Implementation Guide - July 2014\n\n- [Globally Harmonized System of Classification and Labeling of Chemicals]() *USFSAM / PHR*\n\n- [HAZCOM]() *HPWS - ESOH Service Center*\n\n- [ASIMS Occupational Health Supervisor Module Guide, 2013]()\n\n- [AF/SG3P Memo]() - Implementation Guidance for AF Medical Management of Workers Exposed to Beryllium, 18 Nov 2010",
					"Tools": null,
					"Contributions": null,
					"ContentTypeId": "0x0100B2D3D6C931BB534D9AF1CB0299E7F31B",
					"Link": null,
					"ID": 4,
					"Modified": "2015-09-19T15:40:53Z",
					"Created": "2015-08-03T19:16:30Z",
					"AuthorId": 5989,
					"EditorId": 5989,
					"OData__UIVersionString": "5.0",
					"Attachments": false,
					"GUID": "36a3964c-cab1-4482-b612-82eef8cb8f05"
				},
				{
					"__metadata": {
						"id": "Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(5)",
						"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(5)",
						"etag": "\"9\"",
						"type": "SP.Data.ContentListItem"
					},
					"FirstUniqueAncestorSecurableObject": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(5)/FirstUniqueAncestorSecurableObject"
						}
					},
					"RoleAssignments": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(5)/RoleAssignments"
						}
					},
					"AttachmentFiles": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(5)/AttachmentFiles"
						}
					},
					"ContentType": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(5)/ContentType"
						}
					},
					"FieldValuesAsHtml": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(5)/FieldValuesAsHtml"
						}
					},
					"FieldValuesAsText": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(5)/FieldValuesAsText"
						}
					},
					"FieldValuesForEdit": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(5)/FieldValuesForEdit"
						}
					},
					"File": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(5)/File"
						}
					},
					"Folder": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(5)/Folder"
						}
					},
					"ParentList": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(5)/ParentList"
						}
					},
					"FileSystemObjectType": 0,
					"Id": 5,
					"Title": "Influenza Surveillance",
					"Icon": null,
					"Section": "Comm",
					"Program": "Epi",
					"Page": "Flu",
					"rabbitHole": null,
					"Keywords": {
						"__metadata": {
							"type": "Collection(SP.Taxonomy.TaxonomyFieldValue)"
						},
						"results": []
					},
					"References": {
						"__metadata": {
							"type": "Collection(SP.Taxonomy.TaxonomyFieldValue)"
						},
						"results": []
					},
					"Overview": "Check out the latest [Influenza Surveillance Data](https://gumbo2.area52.afnoapps.usaf.mil/epi-consult/index.cfm).",
					"Policy": null,
					"Training": null,
					"Resources": null,
					"Tools": null,
					"Contributions": null,
					"ContentTypeId": "0x0100B2D3D6C931BB534D9AF1CB0299E7F31B",
					"Link": null,
					"ID": 5,
					"Modified": "2015-09-17T04:20:16Z",
					"Created": "2015-08-12T00:35:29Z",
					"AuthorId": 5989,
					"EditorId": 5989,
					"OData__UIVersionString": "5.0",
					"Attachments": false,
					"GUID": "73a4eb44-74e4-469b-baa3-d8469cebcbdd"
				},
				{
					"__metadata": {
						"id": "Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(6)",
						"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(6)",
						"etag": "\"10\"",
						"type": "SP.Data.ContentListItem"
					},
					"FirstUniqueAncestorSecurableObject": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(6)/FirstUniqueAncestorSecurableObject"
						}
					},
					"RoleAssignments": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(6)/RoleAssignments"
						}
					},
					"AttachmentFiles": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(6)/AttachmentFiles"
						}
					},
					"ContentType": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(6)/ContentType"
						}
					},
					"FieldValuesAsHtml": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(6)/FieldValuesAsHtml"
						}
					},
					"FieldValuesAsText": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(6)/FieldValuesAsText"
						}
					},
					"FieldValuesForEdit": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(6)/FieldValuesForEdit"
						}
					},
					"File": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(6)/File"
						}
					},
					"Folder": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(6)/Folder"
						}
					},
					"ParentList": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(6)/ParentList"
						}
					},
					"FileSystemObjectType": 0,
					"Id": 6,
					"Title": "VAERS",
					"Icon": null,
					"Section": "Comm",
					"Program": "Epi",
					"Page": "VAERS",
					"rabbitHole": null,
					"Keywords": {
						"__metadata": {
							"type": "Collection(SP.Taxonomy.TaxonomyFieldValue)"
						},
						"results": []
					},
					"References": {
						"__metadata": {
							"type": "Collection(SP.Taxonomy.TaxonomyFieldValue)"
						},
						"results": []
					},
					"Overview": "### Why?\n\nThe statute 42 USC 300aa-1 to 300aa-34 (*The National Childhood Vaccine Injury Act of 1986*), requires that the following events be reported to VAERS, a public health activity administered by the FDA and CDC:\n\n- Any event listed in the NVIC program’s vaccine injury table (at http://www.hrsa.gov/vaccinecompensation/table.htm) occurring within the time period specified.\n- Any contraindicating event listed in a vaccine’s package insert (product labeling).",
					"Policy": "- Definitions \n- AVIP Current Policies\n- Smallpox Vaccination Program Policies \n- Smallpox Vaccination Program 2008 Q & A - (MILVAX) \n- **Rotavirus Vaccine Information**\n  - AAP's Guidelines for Rotavirus Vaccine Use, 02 Nov 2006\n  - ACIP Recommendations, 11 Aug 2006 \n- **Meningococcal Vaccine Information**\n  - Pink Book Chapter on Meningococcal \n  - ACIP Recommendations, 27 May 2005\n  - Revised ACIP Recommendations, 10 Aug 2007 \n- AFJI 48-110, Immunizations and Chemoprophylaxis",
					"Training": null,
					"Resources": "[USAF Allergy and Immunizations](https://kx.afms.mil/ai)\n\n[CDC Vaccines Home Page](http://www.cdc.gov/vaccines/vpd-vac/default.htm)",
					"Tools": "### Reporting VAERS Events\n\nSubmit VAERS E-Report to the FDA/CDC through the [FDA website](https://vaers.hhs.gov/esub/index) at https://vaers.hhs.gov/esub/index",
					"Contributions": null,
					"ContentTypeId": "0x0100B2D3D6C931BB534D9AF1CB0299E7F31B",
					"Link": null,
					"ID": 6,
					"Modified": "2015-09-12T04:30:32Z",
					"Created": "2015-08-12T02:27:29Z",
					"AuthorId": 5989,
					"EditorId": 5989,
					"OData__UIVersionString": "2.0",
					"Attachments": false,
					"GUID": "f37df72a-6e5d-4fa0-919e-1eb62f08e638"
				},
				{
					"__metadata": {
						"id": "Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(7)",
						"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(7)",
						"etag": "\"4\"",
						"type": "SP.Data.ContentListItem"
					},
					"FirstUniqueAncestorSecurableObject": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(7)/FirstUniqueAncestorSecurableObject"
						}
					},
					"RoleAssignments": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(7)/RoleAssignments"
						}
					},
					"AttachmentFiles": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(7)/AttachmentFiles"
						}
					},
					"ContentType": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(7)/ContentType"
						}
					},
					"FieldValuesAsHtml": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(7)/FieldValuesAsHtml"
						}
					},
					"FieldValuesAsText": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(7)/FieldValuesAsText"
						}
					},
					"FieldValuesForEdit": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(7)/FieldValuesForEdit"
						}
					},
					"File": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(7)/File"
						}
					},
					"Folder": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(7)/Folder"
						}
					},
					"ParentList": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(7)/ParentList"
						}
					},
					"FileSystemObjectType": 0,
					"Id": 7,
					"Title": "AFDRSi",
					"Icon": null,
					"Section": "Comm",
					"Program": "Epi",
					"Page": "AFDRSi",
					"rabbitHole": null,
					"Keywords": {
						"__metadata": {
							"type": "Collection(SP.Taxonomy.TaxonomyFieldValue)"
						},
						"results": []
					},
					"References": {
						"__metadata": {
							"type": "Collection(SP.Taxonomy.TaxonomyFieldValue)"
						},
						"results": []
					},
					"Overview": "As of 2 January 2014 the Air Force Reportable Event Surveillance System (AFRESS) \nwas replaced by the Air Force Disease Reporting System internet (AFDRSi). The website to report Reportable Medical Events (referred to as Medical Event Reports in AFDRSi) can be found here: https://data.nmcphc.med.navy.mil/afdrsi/Login.aspx\n\nGeneral Information\n[Armed Forces Reportable Medical Events Guidelines and Case Definitions (2012)](https://gumbo2.area52.afnoapps.usaf.mil/epi-consult/reportableevents/documents/Tri-Service%20Reportable%20Events,%20Guidelines%20and%20Case%20Definitions%20(2012).pdf)",
					"Policy": null,
					"Training": null,
					"Resources": "- [CDC STD Treatment Guidelines](http://www.cdc.gov/STD/treatment/)\n- [Contaminated Water Disease Information](http://www.cdc.gov/healthywater)\n- [Malaria Guidance](http://www-nehc.med.navy.mil/diseases_conditions/malaria.aspx) (includes Navy Malaria Pocket Guide)\n- [Armed Forces Health Surveillance Center (AFHSC)](http://afhsc.army.mil/home)",
					"Tools": "- AFDRSi SAAR Form (DD2875) - Blank \n  - Note: for sections 17-20b requiring 'Supervisor's' information/signature, this must be a Flight Commander or above \n  - DMIS ID Table - Reference for section 13 of SAAR Form DD2875 \n    - Note: Individuals needing MAJCOM access should list which MAJCOM in box 13 of the SAAR Form and do not need to list all DMIS IDs \n- AFDRSi SAAR Form (DD2875) - Completed Example \n  - Note: Submit completed DD2875 forms to the AFDRSi Helpdesk: \n  - This contact information is for AFDRSi account questions only \n  - Do not encrypt the email \n- usn.hampton-roads.navmcpubhlthcenpors.list.nmcphc-ndrs@mail.mil\n  - tracey.thomas.ctr@med.navy.mil\n  - DSN: (312) 377-0954 COMM: 757-953-0954 \n- If you are submitting your completed DD2875 from overseas or if you are having a difficult time getting through to the AFDRSi Helpdesk, use the following website to upload your DD2875 - https://safe.amrdec.army.mil \n  - Use either of the above listed email addresses for the recipient once in the site \n- Follow-up with a phone call and/or email to the Helpdesk to confirm receipt \n- Once documents are successfully received, accounts will be granted in 1-2 business days \n  - If you are not contacted within 1-2 business days, call the Helpdesk at the phone numbers provided above ",
					"Contributions": null,
					"ContentTypeId": "0x0100B2D3D6C931BB534D9AF1CB0299E7F31B",
					"Link": null,
					"ID": 7,
					"Modified": "2015-09-12T04:30:51Z",
					"Created": "2015-08-12T02:28:24Z",
					"AuthorId": 5989,
					"EditorId": 5989,
					"OData__UIVersionString": "2.0",
					"Attachments": false,
					"GUID": "10b98240-fd9c-4f68-b1ae-465318a5d548"
				},
				{
					"__metadata": {
						"id": "Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(8)",
						"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(8)",
						"etag": "\"4\"",
						"type": "SP.Data.ContentListItem"
					},
					"FirstUniqueAncestorSecurableObject": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(8)/FirstUniqueAncestorSecurableObject"
						}
					},
					"RoleAssignments": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(8)/RoleAssignments"
						}
					},
					"AttachmentFiles": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(8)/AttachmentFiles"
						}
					},
					"ContentType": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(8)/ContentType"
						}
					},
					"FieldValuesAsHtml": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(8)/FieldValuesAsHtml"
						}
					},
					"FieldValuesAsText": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(8)/FieldValuesAsText"
						}
					},
					"FieldValuesForEdit": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(8)/FieldValuesForEdit"
						}
					},
					"File": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(8)/File"
						}
					},
					"Folder": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(8)/Folder"
						}
					},
					"ParentList": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(8)/ParentList"
						}
					},
					"FileSystemObjectType": 0,
					"Id": 8,
					"Title": "ESSENCE",
					"Icon": null,
					"Section": "Comm",
					"Program": "Epi",
					"Page": "ESSENCE",
					"rabbitHole": null,
					"Keywords": {
						"__metadata": {
							"type": "Collection(SP.Taxonomy.TaxonomyFieldValue)"
						},
						"results": []
					},
					"References": {
						"__metadata": {
							"type": "Collection(SP.Taxonomy.TaxonomyFieldValue)"
						},
						"results": []
					},
					"Overview": "ESSENCE guidance and resources",
					"Policy": "**Department of Defense, Health Affairs guidance:**\n\n\"In accordance with HA Policy 07-001, use of ESSENCE must be a part of everyday medical surveillance activities at all levels of the MHS. As with the previous versions of ESSENCE, I (William Winkenwerder, Jr) expect each Service to mandate the use of ESSENCE at all installations where there are qualified public health or preventive medicine professionals. \"\n\n**Air Force specific guidance:**\n\n\"IAW, AFI 48-105, 1.10.6.1 , Public Health (active components) will \"conduct community or location-specific public health surveillance, which includes chemical, biological, radiological, and nuclear (CBRN) terrorism and syndromic surveillance\". \n\n**Command Responsibilities, c. MTF Commanders or OICs shall:** \n\nOn DoD installations in the United States, ensure two trained ESSENCE users (one ofwhom may be the PHEO) are actively monitoring ESSENCE, which is the syndromic surveillance tool for the Department of Defense. For the NGB, ESSENCE shall be monitored centrally with applicable information pushed out to ARNG and ANG units as needed. ",
					"Training": null,
					"Resources": "General Information:\n\n- [ESSENCE Account Registration/Login](https://sso.csd.disa.mil/amserver/UI/Login?org=cac_pki&authlevel=3&goto=https://essence.csd.disa.mil/dmss/actions/LoginPage)\n- [New Electronic System](https://gumbo2.area52.afnoapps.usaf.mil/epi-consult/enhanced/documents/07-001.pdf) for the Early Notification of Community-based Epidemics Medical Surveillance System and Monitoring Requirements\n- [Enhanced Surveillance of Disease Patterns Associated with Biological and Chemical Agents]()\n- [DoDI 6200.03](https://gumbo2.area52.afnoapps.usaf.mil/epi-consult/enhanced/documents/DoDI 6200.03.pdf), Public Health Emergency Management Within the Department of Defense\n- [ESSENCE Usage Memorandum](https://gumbo2.area52.afnoapps.usaf.mil/epi-consult/enhanced/documents/ESSENCE__SG3PM_PH_30Dec09.pdf), 30 Dec 2009",
					"Tools": null,
					"Contributions": null,
					"ContentTypeId": "0x0100B2D3D6C931BB534D9AF1CB0299E7F31B",
					"Link": null,
					"ID": 8,
					"Modified": "2015-09-12T04:31:13Z",
					"Created": "2015-08-12T02:29:09Z",
					"AuthorId": 5989,
					"EditorId": 5989,
					"OData__UIVersionString": "2.0",
					"Attachments": false,
					"GUID": "a0b5ec57-3916-4142-b242-c6fca83e9cfa"
				},
				{
					"__metadata": {
						"id": "Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(9)",
						"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(9)",
						"etag": "\"7\"",
						"type": "SP.Data.ContentListItem"
					},
					"FirstUniqueAncestorSecurableObject": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(9)/FirstUniqueAncestorSecurableObject"
						}
					},
					"RoleAssignments": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(9)/RoleAssignments"
						}
					},
					"AttachmentFiles": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(9)/AttachmentFiles"
						}
					},
					"ContentType": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(9)/ContentType"
						}
					},
					"FieldValuesAsHtml": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(9)/FieldValuesAsHtml"
						}
					},
					"FieldValuesAsText": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(9)/FieldValuesAsText"
						}
					},
					"FieldValuesForEdit": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(9)/FieldValuesForEdit"
						}
					},
					"File": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(9)/File"
						}
					},
					"Folder": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(9)/Folder"
						}
					},
					"ParentList": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(9)/ParentList"
						}
					},
					"FileSystemObjectType": 0,
					"Id": 9,
					"Title": "Reproductive Health & Fetal Protection",
					"Icon": null,
					"Section": "FH",
					"Program": "OccHealth",
					"Page": "Fetal",
					"rabbitHole": null,
					"Keywords": {
						"__metadata": {
							"type": "Collection(SP.Taxonomy.TaxonomyFieldValue)"
						},
						"results": []
					},
					"References": {
						"__metadata": {
							"type": "Collection(SP.Taxonomy.TaxonomyFieldValue)"
						},
						"results": []
					},
					"Overview": "Ensure the occupational safety of expecting mothers in hazardous work environments is maintained.",
					"Policy": "- AFI 10-203, Duty Limiting Conditions, 20 Nov 2014\n- AFI 44-102, Medical Care Management, 20 Jan 2012\n- AFI 48-101, Aerospace Medicine Enterprise, 8 Dec 2014\n- AFI 48-123, Medical Examinations and Standards, 5 Nov 2013\n- AFI 48-145, Occupational and Environmental Health Program, 22 Jul 2014\n- AFI 91-202, The US Air Force Mishap Prevention Program, 5 Aug 2011\n- AFMAN 48-125, Personnel Ionizing Radiation Dosimetry, 4 Oct 2011",
					"Training": null,
					"Resources": null,
					"Tools": null,
					"Contributions": null,
					"ContentTypeId": "0x0100B2D3D6C931BB534D9AF1CB0299E7F31B",
					"Link": null,
					"ID": 9,
					"Modified": "2015-09-12T04:31:32Z",
					"Created": "2015-08-12T02:31:46Z",
					"AuthorId": 5989,
					"EditorId": 5989,
					"OData__UIVersionString": "2.0",
					"Attachments": false,
					"GUID": "695ee465-2a51-4874-b91f-7c751b024249"
				},
				{
					"__metadata": {
						"id": "Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(10)",
						"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(10)",
						"etag": "\"8\"",
						"type": "SP.Data.ContentListItem"
					},
					"FirstUniqueAncestorSecurableObject": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(10)/FirstUniqueAncestorSecurableObject"
						}
					},
					"RoleAssignments": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(10)/RoleAssignments"
						}
					},
					"AttachmentFiles": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(10)/AttachmentFiles"
						}
					},
					"ContentType": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(10)/ContentType"
						}
					},
					"FieldValuesAsHtml": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(10)/FieldValuesAsHtml"
						}
					},
					"FieldValuesAsText": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(10)/FieldValuesAsText"
						}
					},
					"FieldValuesForEdit": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(10)/FieldValuesForEdit"
						}
					},
					"File": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(10)/File"
						}
					},
					"Folder": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(10)/Folder"
						}
					},
					"ParentList": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(10)/ParentList"
						}
					},
					"FileSystemObjectType": 0,
					"Id": 10,
					"Title": "Medical Employee Health",
					"Icon": null,
					"Section": "FH",
					"Program": "OccHealth",
					"Page": "MEHP",
					"rabbitHole": null,
					"Keywords": {
						"__metadata": {
							"type": "Collection(SP.Taxonomy.TaxonomyFieldValue)"
						},
						"results": []
					},
					"References": {
						"__metadata": {
							"type": "Collection(SP.Taxonomy.TaxonomyFieldValue)"
						},
						"results": [
							{
								"Label": "afi44-108",
								"TermGuid": "b2b86062-b292-41d1-912f-e9f5ad1ae067",
								"WssId": 1292
							},
							{
								"Label": "afi48-137",
								"TermGuid": "321bf88d-0ba5-41ac-93c1-8d12d2199657",
								"WssId": 1293
							}
						]
					},
					"Overview": "Tracking and mitigating hospital staff health concerns.",
					"Policy": "- AFI 44-108, Infection Prevention and Control Program, 11 Dec 2014\n- AFI 48-137, Respiratory Protection Program, 15 Jul 2014\n- MMWR Vol. 60/No. RR-7, Immunization of Health-Care Personnel: Recommendations of the Advisory Committee on Immunization Practices (ACIP), 27 Nov 2011",
					"Training": null,
					"Resources": null,
					"Tools": null,
					"Contributions": null,
					"ContentTypeId": "0x0100B2D3D6C931BB534D9AF1CB0299E7F31B",
					"Link": null,
					"ID": 10,
					"Modified": "2015-09-12T04:33:32Z",
					"Created": "2015-08-12T02:32:43Z",
					"AuthorId": 5989,
					"EditorId": 5989,
					"OData__UIVersionString": "2.0",
					"Attachments": false,
					"GUID": "5dcc7200-0204-4d9e-b171-cc31e751b601"
				},
				{
					"__metadata": {
						"id": "Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(11)",
						"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(11)",
						"etag": "\"5\"",
						"type": "SP.Data.ContentListItem"
					},
					"FirstUniqueAncestorSecurableObject": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(11)/FirstUniqueAncestorSecurableObject"
						}
					},
					"RoleAssignments": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(11)/RoleAssignments"
						}
					},
					"AttachmentFiles": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(11)/AttachmentFiles"
						}
					},
					"ContentType": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(11)/ContentType"
						}
					},
					"FieldValuesAsHtml": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(11)/FieldValuesAsHtml"
						}
					},
					"FieldValuesAsText": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(11)/FieldValuesAsText"
						}
					},
					"FieldValuesForEdit": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(11)/FieldValuesForEdit"
						}
					},
					"File": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(11)/File"
						}
					},
					"Folder": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(11)/Folder"
						}
					},
					"ParentList": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(11)/ParentList"
						}
					},
					"FileSystemObjectType": 0,
					"Id": 11,
					"Title": "Hearing Conservation",
					"Icon": null,
					"Section": "FH",
					"Program": "OccHealth",
					"Page": "HCP",
					"rabbitHole": null,
					"Keywords": {
						"__metadata": {
							"type": "Collection(SP.Taxonomy.TaxonomyFieldValue)"
						},
						"results": []
					},
					"References": {
						"__metadata": {
							"type": "Collection(SP.Taxonomy.TaxonomyFieldValue)"
						},
						"results": []
					},
					"Overview": "Monitoring members with occupational hazards threatening their long-term hearing capabilities.",
					"Policy": "- AFOSHSTD 48-20, Occupational Noise and Hearing Conservation Program, 10 May 2013 ",
					"Training": null,
					"Resources": null,
					"Tools": null,
					"Contributions": null,
					"ContentTypeId": "0x0100B2D3D6C931BB534D9AF1CB0299E7F31B",
					"Link": null,
					"ID": 11,
					"Modified": "2015-09-12T04:33:50Z",
					"Created": "2015-08-12T02:33:26Z",
					"AuthorId": 5989,
					"EditorId": 5989,
					"OData__UIVersionString": "2.0",
					"Attachments": false,
					"GUID": "40dc0127-9e03-4c1b-8066-393a18289eb0"
				},
				{
					"__metadata": {
						"id": "Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(12)",
						"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(12)",
						"etag": "\"6\"",
						"type": "SP.Data.ContentListItem"
					},
					"FirstUniqueAncestorSecurableObject": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(12)/FirstUniqueAncestorSecurableObject"
						}
					},
					"RoleAssignments": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(12)/RoleAssignments"
						}
					},
					"AttachmentFiles": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(12)/AttachmentFiles"
						}
					},
					"ContentType": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(12)/ContentType"
						}
					},
					"FieldValuesAsHtml": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(12)/FieldValuesAsHtml"
						}
					},
					"FieldValuesAsText": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(12)/FieldValuesAsText"
						}
					},
					"FieldValuesForEdit": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(12)/FieldValuesForEdit"
						}
					},
					"File": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(12)/File"
						}
					},
					"Folder": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(12)/Folder"
						}
					},
					"ParentList": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(12)/ParentList"
						}
					},
					"FileSystemObjectType": 0,
					"Id": 12,
					"Title": "Public Facility Sanitation",
					"Icon": null,
					"Section": "Comm",
					"Program": "Sanitation",
					"Page": "Facility",
					"rabbitHole": null,
					"Keywords": {
						"__metadata": {
							"type": "Collection(SP.Taxonomy.TaxonomyFieldValue)"
						},
						"results": []
					},
					"References": {
						"__metadata": {
							"type": "Collection(SP.Taxonomy.TaxonomyFieldValue)"
						},
						"results": [
							{
								"Label": "afi48-101",
								"TermGuid": "299379e8-0d0f-45fe-b752-45bb933d4156",
								"WssId": 1281
							}
						]
					},
					"Overview": "Air Force facility sanitation programs address sanitation of public facilities in order to ensure safe practices. Public Health interacts with installation anti-terrorism and threat assessment agencies to audit security and to apply operational risk management to assuring secure facilities.",
					"Policy": "- AFI 48-117, Public Facility Sanitation\n- AFI 48-101, Aerospace Medicine Enterprise\n- AFJI 48-110, Immunizations and Chemoprophylaxis\n- AFI 48-114, Swimming Pools, Spas and Hot Tubs and Natural Bathing Areas\n- AFI 34-248, Child Development Centers\n- AFI 34-249, Youth Programs\n- AFI 34-276, Family Child Care Programs\n- AFI 31-205, The Air Force Corrections System\n- FM 21-10, Field Hygiene and Sanitation\n- CDC Policy memo on Measles Outbreak",
					"Training": null,
					"Resources": null,
					"Tools": "Templates:\n\n-  Example Public Facility Sanitation Annual Report (I)",
					"Contributions": null,
					"ContentTypeId": "0x0100B2D3D6C931BB534D9AF1CB0299E7F31B",
					"Link": null,
					"ID": 12,
					"Modified": "2015-09-12T22:28:04Z",
					"Created": "2015-08-12T08:08:09Z",
					"AuthorId": 5989,
					"EditorId": 5989,
					"OData__UIVersionString": "3.0",
					"Attachments": false,
					"GUID": "186aefea-304d-4d1f-9402-f2f1ca1438dc"
				},
				{
					"__metadata": {
						"id": "Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(13)",
						"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(13)",
						"etag": "\"13\"",
						"type": "SP.Data.ContentListItem"
					},
					"FirstUniqueAncestorSecurableObject": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(13)/FirstUniqueAncestorSecurableObject"
						}
					},
					"RoleAssignments": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(13)/RoleAssignments"
						}
					},
					"AttachmentFiles": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(13)/AttachmentFiles"
						}
					},
					"ContentType": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(13)/ContentType"
						}
					},
					"FieldValuesAsHtml": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(13)/FieldValuesAsHtml"
						}
					},
					"FieldValuesAsText": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(13)/FieldValuesAsText"
						}
					},
					"FieldValuesForEdit": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(13)/FieldValuesForEdit"
						}
					},
					"File": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(13)/File"
						}
					},
					"Folder": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(13)/Folder"
						}
					},
					"ParentList": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(13)/ParentList"
						}
					},
					"FileSystemObjectType": 0,
					"Id": 13,
					"Title": "Vector Surveillance & Entomology",
					"Icon": "map-marker",
					"Section": "Comm",
					"Program": "Ento",
					"Page": null,
					"rabbitHole": null,
					"Keywords": {
						"__metadata": {
							"type": "Collection(SP.Taxonomy.TaxonomyFieldValue)"
						},
						"results": []
					},
					"References": {
						"__metadata": {
							"type": "Collection(SP.Taxonomy.TaxonomyFieldValue)"
						},
						"results": [
							{
								"Label": "afi48-105",
								"TermGuid": "56752e56-6b10-4633-befc-b0522d68994f",
								"WssId": 1282
							}
						]
					},
					"Overview": "The Purpose of Vector Surveillance is to monitor and control mosquitoes that are capable of transmitting disease to humans.\n\n`[...]`",
					"Policy": "Program Reference Documents:\n- DoDI 4150.7, DoD Pest Management Program, 29 May 2008\n- AFJI 48-131, Veterinary Health Services\n- AFI 48-105, Surveillance, Prevention, and Control of Diseases and Conditions of Public Health or Military Significance, \n- AFI 48-102, Medical Entomology Program\n- AFI 32-1053, Integrated Pest Management Program\n- Readiness Skills Verification Education / Training for 43HX and 4E0X1\n- HQ USAF/SG3PM Memorandum, Standardized Readiness Skills Verification (RSV) Training, 23 Jul 2012\n- Control of Communicable Diseases Manual, 20th edition, 2014\n- Communicable Disease Control in Emergencies, WHO 2005\n- HQ USAF/SG Memorandum, Medical Procedures for Deployment Health Surveillance, 22 May 2003\n- AFPMB Technical Guides \n- AFPMB Disease Vector Ecology Profiles \n- USAF Guide to Operational Surveillance of Medically Important Vectors and Pests, “Operational Entomology,” Ver. 2.1, 15 Aug 2005\n\nOTHER DoD ISSUANCES:\n- DoD Directive 3000.10, Contingency Basing Outside the United States, January 10, 2013\n- DoD Directive 3025.18, Defense Support of Civil Authorities, December 29, 2010\n- DoD Directive 4715.1E, Environment, Safety, and Occupational Health (ESOH), March 19, 2005\n- DoD Plan 4150.7-P - Plan For the Certification of Pesticide Applicators, (Cancelled), replaced by DoDM 4150.07, Volume 1, DoD Pest Management Training: The DoD Plan for the Certification of Pesticide Applicators, November 2008\n- DoDM 4150-7-M, DoD Pest Management Training and Certification Manual\n- DoD Guidance 4715.5-G - Overseas Environmental Baseline Guidance Document, May 1, 2007\n- DoD Instruction 6490.03 - Implementation and Application of Joint Medical Surveillance for Deployments\n- DoD Instruction 4140.01-M-1 - Phytosanitary Requirements for Wood Packaging Material",
					"Training": null,
					"Resources": "Surveillance Data: \n\n- [Pest and Vector Identification Data](https://gumbo2.area52.afnoapps.usaf.mil/epi-consult/entomology/Surveillance/mosquito.cfm)\n- [Mosquito Trapping Reports](https://gumbo2.area52.afnoapps.usaf.mil/epi-consult/entomology/Surveillance/reports.cfm)",
					"Tools": null,
					"Contributions": null,
					"ContentTypeId": "0x0100B2D3D6C931BB534D9AF1CB0299E7F31B",
					"Link": null,
					"ID": 13,
					"Modified": "2015-09-19T06:56:38Z",
					"Created": "2015-08-12T08:09:55Z",
					"AuthorId": 5989,
					"EditorId": 5989,
					"OData__UIVersionString": "3.0",
					"Attachments": false,
					"GUID": "bf8509fd-24ca-49af-9f4b-d58d4c3974b6"
				},
				{
					"__metadata": {
						"id": "Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(14)",
						"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(14)",
						"etag": "\"6\"",
						"type": "SP.Data.ContentListItem"
					},
					"FirstUniqueAncestorSecurableObject": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(14)/FirstUniqueAncestorSecurableObject"
						}
					},
					"RoleAssignments": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(14)/RoleAssignments"
						}
					},
					"AttachmentFiles": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(14)/AttachmentFiles"
						}
					},
					"ContentType": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(14)/ContentType"
						}
					},
					"FieldValuesAsHtml": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(14)/FieldValuesAsHtml"
						}
					},
					"FieldValuesAsText": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(14)/FieldValuesAsText"
						}
					},
					"FieldValuesForEdit": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(14)/FieldValuesForEdit"
						}
					},
					"File": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(14)/File"
						}
					},
					"Folder": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(14)/Folder"
						}
					},
					"ParentList": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(14)/ParentList"
						}
					},
					"FileSystemObjectType": 0,
					"Id": 14,
					"Title": "Food Safety",
					"Icon": null,
					"Section": "Comm",
					"Program": "Food",
					"Page": "Safety",
					"rabbitHole": null,
					"Keywords": {
						"__metadata": {
							"type": "Collection(SP.Taxonomy.TaxonomyFieldValue)"
						},
						"results": []
					},
					"References": {
						"__metadata": {
							"type": "Collection(SP.Taxonomy.TaxonomyFieldValue)"
						},
						"results": []
					},
					"Overview": "See left-side menu for full list of topics.",
					"Policy": null,
					"Training": null,
					"Resources": null,
					"Tools": null,
					"Contributions": null,
					"ContentTypeId": "0x0100B2D3D6C931BB534D9AF1CB0299E7F31B",
					"Link": null,
					"ID": 14,
					"Modified": "2015-09-12T04:14:47Z",
					"Created": "2015-08-12T08:11:49Z",
					"AuthorId": 5989,
					"EditorId": 5989,
					"OData__UIVersionString": "1.0",
					"Attachments": false,
					"GUID": "33207778-0ecb-4ede-9b33-5218d590c2a2"
				},
				{
					"__metadata": {
						"id": "Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(15)",
						"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(15)",
						"etag": "\"7\"",
						"type": "SP.Data.ContentListItem"
					},
					"FirstUniqueAncestorSecurableObject": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(15)/FirstUniqueAncestorSecurableObject"
						}
					},
					"RoleAssignments": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(15)/RoleAssignments"
						}
					},
					"AttachmentFiles": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(15)/AttachmentFiles"
						}
					},
					"ContentType": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(15)/ContentType"
						}
					},
					"FieldValuesAsHtml": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(15)/FieldValuesAsHtml"
						}
					},
					"FieldValuesAsText": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(15)/FieldValuesAsText"
						}
					},
					"FieldValuesForEdit": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(15)/FieldValuesForEdit"
						}
					},
					"File": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(15)/File"
						}
					},
					"Folder": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(15)/Folder"
						}
					},
					"ParentList": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(15)/ParentList"
						}
					},
					"FileSystemObjectType": 0,
					"Id": 15,
					"Title": "Food Vulnerability Assessments",
					"Icon": null,
					"Section": "Comm",
					"Program": "Food",
					"Page": "Defense",
					"rabbitHole": "FVA",
					"Keywords": {
						"__metadata": {
							"type": "Collection(SP.Taxonomy.TaxonomyFieldValue)"
						},
						"results": []
					},
					"References": {
						"__metadata": {
							"type": "Collection(SP.Taxonomy.TaxonomyFieldValue)"
						},
						"results": []
					},
					"Overview": "The purpose of Food Vulnerability Assessments are to evaluate and identify vulnerabilities within the food supply chain that can be exploited through intentional contamination.",
					"Policy": "Program Reference Documents:\n\n- DoDI 2000.16 DoD Antiterrorism (AT)Standards \n- DoDI 2000.12 DoD Antiterrorism Program\n- AFI 10-245 Antiterrorism\n- AFMAN 10-246 Food and Water Protection\n- AFI 90-201 AF Inspection Program\n- AFI 31-101 Security\n- AFI 90-802 Risk Management\n- AFPAM 90-803 Risk Management\n- AFPAM 32-1125V1 Key Control\n- AFI 48-116 Food Safety",
					"Training": null,
					"Resources": "- AIB International\n- Employee Handout - Reporting Suspicious Activity \n- Food Defense Handbook from the Univ. of Missouri\n\nOTHER DoD ISSUANCES:\n\n- Food Defense Handbook \n- JSIVA Security Classification Guide, 2012\n- DoD Vulnerability Assessment Benchmarks, 2013\n- AF Food Vulnerability Assessment Benchmarks, 2015\n- Food Defense Security Measures \n- Unified Facilities Criteria 4-722-01 ",
					"Tools": "Forms:\n\n- Distribution Center FVA Guided Discussion Worksheet 2015\n- Distribution Center FVA Worksheet 2015\n- DoD Food Establishment FVA Guided Discussion Worksheet 2015\n- DoD Food Establishment FVA Worksheet 2015\n- Local and Vendor Food Establishment FVA Guided Worksheet 2015\n- Local and Vendor Food Establishment FVA Worksheet 2015\n\nTemplates:\n\n- FVA Final Report for BASE TEMPLATE 2015  \n- Food Defense Plan (Pending)\n- FVA Tasker MASTER TEMPLATE 2015\n- Facility and Vendor List",
					"Contributions": null,
					"ContentTypeId": "0x0100B2D3D6C931BB534D9AF1CB0299E7F31B",
					"Link": null,
					"ID": 15,
					"Modified": "2015-09-12T04:50:08Z",
					"Created": "2015-08-26T23:00:19Z",
					"AuthorId": 5989,
					"EditorId": 5989,
					"OData__UIVersionString": "2.0",
					"Attachments": false,
					"GUID": "2b3b20d9-c154-460e-904d-f9a4ede816ba"
				},
				{
					"__metadata": {
						"id": "Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(16)",
						"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(16)",
						"etag": "\"10\"",
						"type": "SP.Data.ContentListItem"
					},
					"FirstUniqueAncestorSecurableObject": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(16)/FirstUniqueAncestorSecurableObject"
						}
					},
					"RoleAssignments": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(16)/RoleAssignments"
						}
					},
					"AttachmentFiles": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(16)/AttachmentFiles"
						}
					},
					"ContentType": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(16)/ContentType"
						}
					},
					"FieldValuesAsHtml": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(16)/FieldValuesAsHtml"
						}
					},
					"FieldValuesAsText": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(16)/FieldValuesAsText"
						}
					},
					"FieldValuesForEdit": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(16)/FieldValuesForEdit"
						}
					},
					"File": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(16)/File"
						}
					},
					"Folder": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(16)/Folder"
						}
					},
					"ParentList": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(16)/ParentList"
						}
					},
					"FileSystemObjectType": 0,
					"Id": 16,
					"Title": "Public Health",
					"Icon": null,
					"Section": null,
					"Program": null,
					"Page": null,
					"rabbitHole": null,
					"Keywords": {
						"__metadata": {
							"type": "Collection(SP.Taxonomy.TaxonomyFieldValue)"
						},
						"results": []
					},
					"References": {
						"__metadata": {
							"type": "Collection(SP.Taxonomy.TaxonomyFieldValue)"
						},
						"results": []
					},
					"Overview": "### Homepage Stuffsz",
					"Policy": null,
					"Training": null,
					"Resources": null,
					"Tools": null,
					"Contributions": null,
					"ContentTypeId": "0x0100B2D3D6C931BB534D9AF1CB0299E7F31B",
					"Link": null,
					"ID": 16,
					"Modified": "2015-09-12T07:06:40Z",
					"Created": "2015-08-27T01:01:48Z",
					"AuthorId": 5989,
					"EditorId": 5989,
					"OData__UIVersionString": "3.0",
					"Attachments": false,
					"GUID": "7488a5fa-6498-4e32-a814-ee58433b2f96"
				},
				{
					"__metadata": {
						"id": "Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(17)",
						"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(17)",
						"etag": "\"10\"",
						"type": "SP.Data.ContentListItem"
					},
					"FirstUniqueAncestorSecurableObject": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(17)/FirstUniqueAncestorSecurableObject"
						}
					},
					"RoleAssignments": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(17)/RoleAssignments"
						}
					},
					"AttachmentFiles": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(17)/AttachmentFiles"
						}
					},
					"ContentType": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(17)/ContentType"
						}
					},
					"FieldValuesAsHtml": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(17)/FieldValuesAsHtml"
						}
					},
					"FieldValuesAsText": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(17)/FieldValuesAsText"
						}
					},
					"FieldValuesForEdit": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(17)/FieldValuesForEdit"
						}
					},
					"File": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(17)/File"
						}
					},
					"Folder": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(17)/Folder"
						}
					},
					"ParentList": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(17)/ParentList"
						}
					},
					"FileSystemObjectType": 0,
					"Id": 17,
					"Title": "Force Health",
					"Icon": null,
					"Section": "FH",
					"Program": null,
					"Page": null,
					"rabbitHole": null,
					"Keywords": {
						"__metadata": {
							"type": "Collection(SP.Taxonomy.TaxonomyFieldValue)"
						},
						"results": []
					},
					"References": {
						"__metadata": {
							"type": "Collection(SP.Taxonomy.TaxonomyFieldValue)"
						},
						"results": []
					},
					"Overview": "Calibrated Popicon\n\n|test|Hey|location|\n|--|--|--|\n|When|Where|[hyperlink](http://google.com)|",
					"Policy": null,
					"Training": null,
					"Resources": null,
					"Tools": null,
					"Contributions": null,
					"ContentTypeId": "0x0100B2D3D6C931BB534D9AF1CB0299E7F31B",
					"Link": null,
					"ID": 17,
					"Modified": "2015-09-12T07:06:54Z",
					"Created": "2015-08-27T01:02:24Z",
					"AuthorId": 5989,
					"EditorId": 5989,
					"OData__UIVersionString": "3.0",
					"Attachments": false,
					"GUID": "8a395424-22d0-4856-9e11-cfc7dd06bb9e"
				},
				{
					"__metadata": {
						"id": "Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(18)",
						"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(18)",
						"etag": "\"8\"",
						"type": "SP.Data.ContentListItem"
					},
					"FirstUniqueAncestorSecurableObject": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(18)/FirstUniqueAncestorSecurableObject"
						}
					},
					"RoleAssignments": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(18)/RoleAssignments"
						}
					},
					"AttachmentFiles": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(18)/AttachmentFiles"
						}
					},
					"ContentType": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(18)/ContentType"
						}
					},
					"FieldValuesAsHtml": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(18)/FieldValuesAsHtml"
						}
					},
					"FieldValuesAsText": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(18)/FieldValuesAsText"
						}
					},
					"FieldValuesForEdit": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(18)/FieldValuesForEdit"
						}
					},
					"File": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(18)/File"
						}
					},
					"Folder": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(18)/Folder"
						}
					},
					"ParentList": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(18)/ParentList"
						}
					},
					"FileSystemObjectType": 0,
					"Id": 18,
					"Title": "Community Health",
					"Icon": null,
					"Section": "Comm",
					"Program": null,
					"Page": null,
					"rabbitHole": null,
					"Keywords": {
						"__metadata": {
							"type": "Collection(SP.Taxonomy.TaxonomyFieldValue)"
						},
						"results": []
					},
					"References": {
						"__metadata": {
							"type": "Collection(SP.Taxonomy.TaxonomyFieldValue)"
						},
						"results": []
					},
					"Overview": "Spontaneously splendid.\n\n### /Comm",
					"Policy": null,
					"Training": null,
					"Resources": null,
					"Tools": null,
					"Contributions": null,
					"ContentTypeId": "0x0100B2D3D6C931BB534D9AF1CB0299E7F31B",
					"Link": null,
					"ID": 18,
					"Modified": "2015-09-12T07:07:11Z",
					"Created": "2015-08-27T01:02:48Z",
					"AuthorId": 5989,
					"EditorId": 5989,
					"OData__UIVersionString": "3.0",
					"Attachments": false,
					"GUID": "9b0e64ff-0f18-4d16-b3f8-2a0e9fa21603"
				},
				{
					"__metadata": {
						"id": "Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(20)",
						"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(20)",
						"etag": "\"5\"",
						"type": "SP.Data.ContentListItem"
					},
					"FirstUniqueAncestorSecurableObject": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(20)/FirstUniqueAncestorSecurableObject"
						}
					},
					"RoleAssignments": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(20)/RoleAssignments"
						}
					},
					"AttachmentFiles": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(20)/AttachmentFiles"
						}
					},
					"ContentType": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(20)/ContentType"
						}
					},
					"FieldValuesAsHtml": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(20)/FieldValuesAsHtml"
						}
					},
					"FieldValuesAsText": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(20)/FieldValuesAsText"
						}
					},
					"FieldValuesForEdit": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(20)/FieldValuesForEdit"
						}
					},
					"File": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(20)/File"
						}
					},
					"Folder": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(20)/Folder"
						}
					},
					"ParentList": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(20)/ParentList"
						}
					},
					"FileSystemObjectType": 0,
					"Id": 20,
					"Title": "Food Defense",
					"Icon": null,
					"Section": "Comm",
					"Program": "Food",
					"Page": "Defense",
					"rabbitHole": null,
					"Keywords": {
						"__metadata": {
							"type": "Collection(SP.Taxonomy.TaxonomyFieldValue)"
						},
						"results": []
					},
					"References": {
						"__metadata": {
							"type": "Collection(SP.Taxonomy.TaxonomyFieldValue)"
						},
						"results": []
					},
					"Overview": "See left navigation for full scope of available information.\n\n`[...]`",
					"Policy": null,
					"Training": null,
					"Resources": null,
					"Tools": null,
					"Contributions": null,
					"ContentTypeId": "0x0100B2D3D6C931BB534D9AF1CB0299E7F31B",
					"Link": null,
					"ID": 20,
					"Modified": "2015-09-13T06:56:26Z",
					"Created": "2015-08-29T11:00:02Z",
					"AuthorId": 5989,
					"EditorId": 5989,
					"OData__UIVersionString": "3.0",
					"Attachments": false,
					"GUID": "89a4ea03-bac2-4e79-ab01-dcf0f9626c97"
				},
				{
					"__metadata": {
						"id": "Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(21)",
						"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(21)",
						"etag": "\"7\"",
						"type": "SP.Data.ContentListItem"
					},
					"FirstUniqueAncestorSecurableObject": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(21)/FirstUniqueAncestorSecurableObject"
						}
					},
					"RoleAssignments": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(21)/RoleAssignments"
						}
					},
					"AttachmentFiles": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(21)/AttachmentFiles"
						}
					},
					"ContentType": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(21)/ContentType"
						}
					},
					"FieldValuesAsHtml": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(21)/FieldValuesAsHtml"
						}
					},
					"FieldValuesAsText": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(21)/FieldValuesAsText"
						}
					},
					"FieldValuesForEdit": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(21)/FieldValuesForEdit"
						}
					},
					"File": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(21)/File"
						}
					},
					"Folder": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(21)/Folder"
						}
					},
					"ParentList": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(21)/ParentList"
						}
					},
					"FileSystemObjectType": 0,
					"Id": 21,
					"Title": "Deployment Health",
					"Icon": "world",
					"Section": "FH",
					"Program": "DeploymentHealth",
					"Page": null,
					"rabbitHole": null,
					"Keywords": {
						"__metadata": {
							"type": "Collection(SP.Taxonomy.TaxonomyFieldValue)"
						},
						"results": []
					},
					"References": {
						"__metadata": {
							"type": "Collection(SP.Taxonomy.TaxonomyFieldValue)"
						},
						"results": []
					},
					"Overview": "Visit the [Deployment Health](https://kx.afms.mil/kj/kx3/deploymenthealth) website.\n\nTest",
					"Policy": null,
					"Training": null,
					"Resources": null,
					"Tools": null,
					"Contributions": null,
					"ContentTypeId": "0x0100B2D3D6C931BB534D9AF1CB0299E7F31B",
					"Link": null,
					"ID": 21,
					"Modified": "2015-09-21T18:24:44Z",
					"Created": "2015-09-11T15:08:39Z",
					"AuthorId": 422,
					"EditorId": 422,
					"OData__UIVersionString": "5.0",
					"Attachments": false,
					"GUID": "b76cf18f-b405-4cbf-8623-44de0cccd2e4"
				},
				{
					"__metadata": {
						"id": "Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(23)",
						"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(23)",
						"etag": "\"5\"",
						"type": "SP.Data.ContentListItem"
					},
					"FirstUniqueAncestorSecurableObject": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(23)/FirstUniqueAncestorSecurableObject"
						}
					},
					"RoleAssignments": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(23)/RoleAssignments"
						}
					},
					"AttachmentFiles": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(23)/AttachmentFiles"
						}
					},
					"ContentType": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(23)/ContentType"
						}
					},
					"FieldValuesAsHtml": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(23)/FieldValuesAsHtml"
						}
					},
					"FieldValuesAsText": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(23)/FieldValuesAsText"
						}
					},
					"FieldValuesForEdit": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(23)/FieldValuesForEdit"
						}
					},
					"File": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(23)/File"
						}
					},
					"Folder": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(23)/Folder"
						}
					},
					"ParentList": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(23)/ParentList"
						}
					},
					"FileSystemObjectType": 0,
					"Id": 23,
					"Title": "ALFOODACTS",
					"Icon": null,
					"Section": "Comm",
					"Program": "Food",
					"Page": "Safety",
					"rabbitHole": "ALFOODACTS",
					"Keywords": {
						"__metadata": {
							"type": "Collection(SP.Taxonomy.TaxonomyFieldValue)"
						},
						"results": [
							{
								"Label": "food",
								"TermGuid": "55e99f3e-e1dc-446c-be90-fefabe862f23",
								"WssId": 1289
							}
						]
					},
					"References": {
						"__metadata": {
							"type": "Collection(SP.Taxonomy.TaxonomyFieldValue)"
						},
						"results": [
							{
								"Label": "afi48-116",
								"TermGuid": "94a4c95e-da74-4bcc-9cc1-82126b9162a5",
								"WssId": 1290
							}
						]
					},
					"Overview": "WIZZY-WIG",
					"Policy": null,
					"Training": null,
					"Resources": null,
					"Tools": null,
					"Contributions": null,
					"ContentTypeId": "0x0100B2D3D6C931BB534D9AF1CB0299E7F31B",
					"Link": null,
					"ID": 23,
					"Modified": "2015-09-12T04:49:34Z",
					"Created": "2015-09-11T15:19:25Z",
					"AuthorId": 422,
					"EditorId": 5989,
					"OData__UIVersionString": "3.0",
					"Attachments": false,
					"GUID": "2f456bf9-227f-4b7d-973a-2ca5a9e70caa"
				},
				{
					"__metadata": {
						"id": "Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(24)",
						"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(24)",
						"etag": "\"2\"",
						"type": "SP.Data.ContentListItem"
					},
					"FirstUniqueAncestorSecurableObject": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(24)/FirstUniqueAncestorSecurableObject"
						}
					},
					"RoleAssignments": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(24)/RoleAssignments"
						}
					},
					"AttachmentFiles": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(24)/AttachmentFiles"
						}
					},
					"ContentType": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(24)/ContentType"
						}
					},
					"FieldValuesAsHtml": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(24)/FieldValuesAsHtml"
						}
					},
					"FieldValuesAsText": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(24)/FieldValuesAsText"
						}
					},
					"FieldValuesForEdit": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(24)/FieldValuesForEdit"
						}
					},
					"File": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(24)/File"
						}
					},
					"Folder": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(24)/Folder"
						}
					},
					"ParentList": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(24)/ParentList"
						}
					},
					"FileSystemObjectType": 0,
					"Id": 24,
					"Title": "Food Protection",
					"Icon": "coffee",
					"Section": "Comm",
					"Program": "Food",
					"Page": null,
					"rabbitHole": null,
					"Keywords": {
						"__metadata": {
							"type": "Collection(SP.Taxonomy.TaxonomyFieldValue)"
						},
						"results": [
							{
								"Label": "food",
								"TermGuid": "55e99f3e-e1dc-446c-be90-fefabe862f23",
								"WssId": 1289
							}
						]
					},
					"References": {
						"__metadata": {
							"type": "Collection(SP.Taxonomy.TaxonomyFieldValue)"
						},
						"results": []
					},
					"Overview": "**Protect that meal**\n\n> Delish.",
					"Policy": null,
					"Training": null,
					"Resources": null,
					"Tools": null,
					"Contributions": null,
					"ContentTypeId": "0x0100B2D3D6C931BB534D9AF1CB0299E7F31B",
					"Link": null,
					"ID": 24,
					"Modified": "2015-09-19T06:53:05Z",
					"Created": "2015-09-12T04:39:30Z",
					"AuthorId": 5989,
					"EditorId": 5989,
					"OData__UIVersionString": "2.0",
					"Attachments": false,
					"GUID": "14387e55-1dc6-4ac5-84c1-7cdcaef9a43e"
				},
				{
					"__metadata": {
						"id": "Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(25)",
						"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(25)",
						"etag": "\"2\"",
						"type": "SP.Data.ContentListItem"
					},
					"FirstUniqueAncestorSecurableObject": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(25)/FirstUniqueAncestorSecurableObject"
						}
					},
					"RoleAssignments": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(25)/RoleAssignments"
						}
					},
					"AttachmentFiles": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(25)/AttachmentFiles"
						}
					},
					"ContentType": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(25)/ContentType"
						}
					},
					"FieldValuesAsHtml": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(25)/FieldValuesAsHtml"
						}
					},
					"FieldValuesAsText": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(25)/FieldValuesAsText"
						}
					},
					"FieldValuesForEdit": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(25)/FieldValuesForEdit"
						}
					},
					"File": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(25)/File"
						}
					},
					"Folder": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(25)/Folder"
						}
					},
					"ParentList": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(25)/ParentList"
						}
					},
					"FileSystemObjectType": 0,
					"Id": 25,
					"Title": "General Sanitation",
					"Icon": "drop",
					"Section": "Comm",
					"Program": "Sanitation",
					"Page": null,
					"rabbitHole": null,
					"Keywords": {
						"__metadata": {
							"type": "Collection(SP.Taxonomy.TaxonomyFieldValue)"
						},
						"results": []
					},
					"References": {
						"__metadata": {
							"type": "Collection(SP.Taxonomy.TaxonomyFieldValue)"
						},
						"results": []
					},
					"Overview": "Sanitized",
					"Policy": null,
					"Training": null,
					"Resources": null,
					"Tools": null,
					"Contributions": null,
					"ContentTypeId": "0x0100B2D3D6C931BB534D9AF1CB0299E7F31B",
					"Link": null,
					"ID": 25,
					"Modified": "2015-09-19T06:53:22Z",
					"Created": "2015-09-12T11:29:27Z",
					"AuthorId": 5989,
					"EditorId": 5989,
					"OData__UIVersionString": "2.0",
					"Attachments": false,
					"GUID": "fcbbf5f9-9729-4c2e-861f-048105879ac9"
				},
				{
					"__metadata": {
						"id": "Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(26)",
						"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(26)",
						"etag": "\"1\"",
						"type": "SP.Data.ContentListItem"
					},
					"FirstUniqueAncestorSecurableObject": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(26)/FirstUniqueAncestorSecurableObject"
						}
					},
					"RoleAssignments": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(26)/RoleAssignments"
						}
					},
					"AttachmentFiles": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(26)/AttachmentFiles"
						}
					},
					"ContentType": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(26)/ContentType"
						}
					},
					"FieldValuesAsHtml": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(26)/FieldValuesAsHtml"
						}
					},
					"FieldValuesAsText": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(26)/FieldValuesAsText"
						}
					},
					"FieldValuesForEdit": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(26)/FieldValuesForEdit"
						}
					},
					"File": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(26)/File"
						}
					},
					"Folder": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(26)/Folder"
						}
					},
					"ParentList": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(26)/ParentList"
						}
					},
					"FileSystemObjectType": 0,
					"Id": 26,
					"Title": "Local Approval Sources",
					"Icon": null,
					"Section": "Comm",
					"Program": "Food",
					"Page": "Safety",
					"rabbitHole": "Local",
					"Keywords": {
						"__metadata": {
							"type": "Collection(SP.Taxonomy.TaxonomyFieldValue)"
						},
						"results": []
					},
					"References": {
						"__metadata": {
							"type": "Collection(SP.Taxonomy.TaxonomyFieldValue)"
						},
						"results": []
					},
					"Overview": "`When you just gotta have that local source at on speed dial.`",
					"Policy": null,
					"Training": null,
					"Resources": null,
					"Tools": null,
					"Contributions": null,
					"ContentTypeId": "0x0100B2D3D6C931BB534D9AF1CB0299E7F31B",
					"Link": null,
					"ID": 26,
					"Modified": "2015-09-12T21:54:33Z",
					"Created": "2015-09-12T21:54:33Z",
					"AuthorId": 5989,
					"EditorId": 5989,
					"OData__UIVersionString": "1.0",
					"Attachments": false,
					"GUID": "d573c3e9-4a08-444b-8e73-67fa6353082f"
				},
				{
					"__metadata": {
						"id": "Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(27)",
						"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(27)",
						"etag": "\"1\"",
						"type": "SP.Data.ContentListItem"
					},
					"FirstUniqueAncestorSecurableObject": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(27)/FirstUniqueAncestorSecurableObject"
						}
					},
					"RoleAssignments": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(27)/RoleAssignments"
						}
					},
					"AttachmentFiles": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(27)/AttachmentFiles"
						}
					},
					"ContentType": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(27)/ContentType"
						}
					},
					"FieldValuesAsHtml": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(27)/FieldValuesAsHtml"
						}
					},
					"FieldValuesAsText": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(27)/FieldValuesAsText"
						}
					},
					"FieldValuesForEdit": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(27)/FieldValuesForEdit"
						}
					},
					"File": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(27)/File"
						}
					},
					"Folder": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(27)/Folder"
						}
					},
					"ParentList": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(27)/ParentList"
						}
					},
					"FileSystemObjectType": 0,
					"Id": 27,
					"Title": "Food Facility Sanitation",
					"Icon": null,
					"Section": "Comm",
					"Program": "Food",
					"Page": "Safety",
					"rabbitHole": "Facility",
					"Keywords": {
						"__metadata": {
							"type": "Collection(SP.Taxonomy.TaxonomyFieldValue)"
						},
						"results": []
					},
					"References": {
						"__metadata": {
							"type": "Collection(SP.Taxonomy.TaxonomyFieldValue)"
						},
						"results": []
					},
					"Overview": "Make sure they clean!",
					"Policy": null,
					"Training": null,
					"Resources": null,
					"Tools": null,
					"Contributions": null,
					"ContentTypeId": "0x0100B2D3D6C931BB534D9AF1CB0299E7F31B",
					"Link": null,
					"ID": 27,
					"Modified": "2015-09-12T22:24:20Z",
					"Created": "2015-09-12T22:24:20Z",
					"AuthorId": 5989,
					"EditorId": 5989,
					"OData__UIVersionString": "1.0",
					"Attachments": false,
					"GUID": "1dd219ae-232e-4e2e-8901-baefbeea6495"
				},
				{
					"__metadata": {
						"id": "Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(28)",
						"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(28)",
						"etag": "\"1\"",
						"type": "SP.Data.ContentListItem"
					},
					"FirstUniqueAncestorSecurableObject": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(28)/FirstUniqueAncestorSecurableObject"
						}
					},
					"RoleAssignments": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(28)/RoleAssignments"
						}
					},
					"AttachmentFiles": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(28)/AttachmentFiles"
						}
					},
					"ContentType": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(28)/ContentType"
						}
					},
					"FieldValuesAsHtml": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(28)/FieldValuesAsHtml"
						}
					},
					"FieldValuesAsText": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(28)/FieldValuesAsText"
						}
					},
					"FieldValuesForEdit": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(28)/FieldValuesForEdit"
						}
					},
					"File": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(28)/File"
						}
					},
					"Folder": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(28)/Folder"
						}
					},
					"ParentList": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(28)/ParentList"
						}
					},
					"FileSystemObjectType": 0,
					"Id": 28,
					"Title": "Food Inspection",
					"Icon": null,
					"Section": "Comm",
					"Program": "Food",
					"Page": "Safety",
					"rabbitHole": "Inspection",
					"Keywords": {
						"__metadata": {
							"type": "Collection(SP.Taxonomy.TaxonomyFieldValue)"
						},
						"results": []
					},
					"References": {
						"__metadata": {
							"type": "Collection(SP.Taxonomy.TaxonomyFieldValue)"
						},
						"results": []
					},
					"Overview": "### IG",
					"Policy": null,
					"Training": null,
					"Resources": null,
					"Tools": null,
					"Contributions": null,
					"ContentTypeId": "0x0100B2D3D6C931BB534D9AF1CB0299E7F31B",
					"Link": null,
					"ID": 28,
					"Modified": "2015-09-12T22:25:04Z",
					"Created": "2015-09-12T22:25:04Z",
					"AuthorId": 5989,
					"EditorId": 5989,
					"OData__UIVersionString": "1.0",
					"Attachments": false,
					"GUID": "653dea69-99ce-438e-b238-df88f8132988"
				},
				{
					"__metadata": {
						"id": "Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(29)",
						"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(29)",
						"etag": "\"1\"",
						"type": "SP.Data.ContentListItem"
					},
					"FirstUniqueAncestorSecurableObject": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(29)/FirstUniqueAncestorSecurableObject"
						}
					},
					"RoleAssignments": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(29)/RoleAssignments"
						}
					},
					"AttachmentFiles": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(29)/AttachmentFiles"
						}
					},
					"ContentType": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(29)/ContentType"
						}
					},
					"FieldValuesAsHtml": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(29)/FieldValuesAsHtml"
						}
					},
					"FieldValuesAsText": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(29)/FieldValuesAsText"
						}
					},
					"FieldValuesForEdit": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(29)/FieldValuesForEdit"
						}
					},
					"File": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(29)/File"
						}
					},
					"Folder": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(29)/Folder"
						}
					},
					"ParentList": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(29)/ParentList"
						}
					},
					"FileSystemObjectType": 0,
					"Id": 29,
					"Title": "Rations",
					"Icon": null,
					"Section": "Comm",
					"Program": "Food",
					"Page": "Safety",
					"rabbitHole": "Rations",
					"Keywords": {
						"__metadata": {
							"type": "Collection(SP.Taxonomy.TaxonomyFieldValue)"
						},
						"results": []
					},
					"References": {
						"__metadata": {
							"type": "Collection(SP.Taxonomy.TaxonomyFieldValue)"
						},
						"results": []
					},
					"Overview": "Less is more.",
					"Policy": null,
					"Training": null,
					"Resources": null,
					"Tools": null,
					"Contributions": null,
					"ContentTypeId": "0x0100B2D3D6C931BB534D9AF1CB0299E7F31B",
					"Link": null,
					"ID": 29,
					"Modified": "2015-09-12T22:25:29Z",
					"Created": "2015-09-12T22:25:29Z",
					"AuthorId": 5989,
					"EditorId": 5989,
					"OData__UIVersionString": "1.0",
					"Attachments": false,
					"GUID": "0499c494-7fb2-4ec7-840c-c62853a7a5d2"
				},
				{
					"__metadata": {
						"id": "Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(30)",
						"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(30)",
						"etag": "\"1\"",
						"type": "SP.Data.ContentListItem"
					},
					"FirstUniqueAncestorSecurableObject": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(30)/FirstUniqueAncestorSecurableObject"
						}
					},
					"RoleAssignments": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(30)/RoleAssignments"
						}
					},
					"AttachmentFiles": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(30)/AttachmentFiles"
						}
					},
					"ContentType": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(30)/ContentType"
						}
					},
					"FieldValuesAsHtml": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(30)/FieldValuesAsHtml"
						}
					},
					"FieldValuesAsText": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(30)/FieldValuesAsText"
						}
					},
					"FieldValuesForEdit": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(30)/FieldValuesForEdit"
						}
					},
					"File": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(30)/File"
						}
					},
					"Folder": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(30)/Folder"
						}
					},
					"ParentList": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(30)/ParentList"
						}
					},
					"FileSystemObjectType": 0,
					"Id": 30,
					"Title": "Field Sanitation",
					"Icon": null,
					"Section": "Comm",
					"Program": "Sanitation",
					"Page": "Field",
					"rabbitHole": null,
					"Keywords": {
						"__metadata": {
							"type": "Collection(SP.Taxonomy.TaxonomyFieldValue)"
						},
						"results": []
					},
					"References": {
						"__metadata": {
							"type": "Collection(SP.Taxonomy.TaxonomyFieldValue)"
						},
						"results": []
					},
					"Overview": "> Makes me think of **The Sield**",
					"Policy": null,
					"Training": null,
					"Resources": null,
					"Tools": null,
					"Contributions": null,
					"ContentTypeId": "0x0100B2D3D6C931BB534D9AF1CB0299E7F31B",
					"Link": null,
					"ID": 30,
					"Modified": "2015-09-12T22:27:35Z",
					"Created": "2015-09-12T22:27:35Z",
					"AuthorId": 5989,
					"EditorId": 5989,
					"OData__UIVersionString": "1.0",
					"Attachments": false,
					"GUID": "d115215e-99ec-4044-ae06-bf4f295cd1eb"
				},
				{
					"__metadata": {
						"id": "Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(31)",
						"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(31)",
						"etag": "\"2\"",
						"type": "SP.Data.ContentListItem"
					},
					"FirstUniqueAncestorSecurableObject": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(31)/FirstUniqueAncestorSecurableObject"
						}
					},
					"RoleAssignments": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(31)/RoleAssignments"
						}
					},
					"AttachmentFiles": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(31)/AttachmentFiles"
						}
					},
					"ContentType": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(31)/ContentType"
						}
					},
					"FieldValuesAsHtml": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(31)/FieldValuesAsHtml"
						}
					},
					"FieldValuesAsText": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(31)/FieldValuesAsText"
						}
					},
					"FieldValuesForEdit": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(31)/FieldValuesForEdit"
						}
					},
					"File": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(31)/File"
						}
					},
					"Folder": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(31)/Folder"
						}
					},
					"ParentList": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(31)/ParentList"
						}
					},
					"FileSystemObjectType": 0,
					"Id": 31,
					"Title": "Surveillance Data",
					"Icon": null,
					"Section": "Comm",
					"Program": "Ento",
					"Page": "Surveys",
					"rabbitHole": null,
					"Keywords": {
						"__metadata": {
							"type": "Collection(SP.Taxonomy.TaxonomyFieldValue)"
						},
						"results": []
					},
					"References": {
						"__metadata": {
							"type": "Collection(SP.Taxonomy.TaxonomyFieldValue)"
						},
						"results": []
					},
					"Overview": "View the current [Surveillance Data](https://gumbo2.area52.afnoapps.usaf.mil/epi-consult/entomology/).",
					"Policy": null,
					"Training": null,
					"Resources": null,
					"Tools": null,
					"Contributions": null,
					"ContentTypeId": "0x0100B2D3D6C931BB534D9AF1CB0299E7F31B",
					"Link": null,
					"ID": 31,
					"Modified": "2015-09-17T04:17:25Z",
					"Created": "2015-09-13T01:23:48Z",
					"AuthorId": 5989,
					"EditorId": 5989,
					"OData__UIVersionString": "2.0",
					"Attachments": false,
					"GUID": "778a7a3c-0761-4058-aec7-8a87956dde73"
				},
				{
					"__metadata": {
						"id": "Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(33)",
						"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(33)",
						"etag": "\"1\"",
						"type": "SP.Data.ContentListItem"
					},
					"FirstUniqueAncestorSecurableObject": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(33)/FirstUniqueAncestorSecurableObject"
						}
					},
					"RoleAssignments": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(33)/RoleAssignments"
						}
					},
					"AttachmentFiles": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(33)/AttachmentFiles"
						}
					},
					"ContentType": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(33)/ContentType"
						}
					},
					"FieldValuesAsHtml": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(33)/FieldValuesAsHtml"
						}
					},
					"FieldValuesAsText": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(33)/FieldValuesAsText"
						}
					},
					"FieldValuesForEdit": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(33)/FieldValuesForEdit"
						}
					},
					"File": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(33)/File"
						}
					},
					"Folder": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(33)/Folder"
						}
					},
					"ParentList": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(33)/ParentList"
						}
					},
					"FileSystemObjectType": 0,
					"Id": 33,
					"Title": "Research",
					"Icon": null,
					"Section": "Research",
					"Program": null,
					"Page": null,
					"rabbitHole": null,
					"Keywords": {
						"__metadata": {
							"type": "Collection(SP.Taxonomy.TaxonomyFieldValue)"
						},
						"results": []
					},
					"References": {
						"__metadata": {
							"type": "Collection(SP.Taxonomy.TaxonomyFieldValue)"
						},
						"results": []
					},
					"Overview": "### New Page :)\n#### Joy",
					"Policy": null,
					"Training": null,
					"Resources": null,
					"Tools": null,
					"Contributions": null,
					"ContentTypeId": "0x0100B2D3D6C931BB534D9AF1CB0299E7F31B",
					"Link": null,
					"ID": 33,
					"Modified": "2015-09-21T18:06:43Z",
					"Created": "2015-09-21T18:06:43Z",
					"AuthorId": 20950,
					"EditorId": 20950,
					"OData__UIVersionString": "1.0",
					"Attachments": false,
					"GUID": "c4f0e91b-aec6-4f05-952b-4cbe42efb8dc"
				},
				{
					"__metadata": {
						"id": "Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(34)",
						"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(34)",
						"etag": "\"1\"",
						"type": "SP.Data.ContentListItem"
					},
					"FirstUniqueAncestorSecurableObject": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(34)/FirstUniqueAncestorSecurableObject"
						}
					},
					"RoleAssignments": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(34)/RoleAssignments"
						}
					},
					"AttachmentFiles": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(34)/AttachmentFiles"
						}
					},
					"ContentType": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(34)/ContentType"
						}
					},
					"FieldValuesAsHtml": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(34)/FieldValuesAsHtml"
						}
					},
					"FieldValuesAsText": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(34)/FieldValuesAsText"
						}
					},
					"FieldValuesForEdit": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(34)/FieldValuesForEdit"
						}
					},
					"File": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(34)/File"
						}
					},
					"Folder": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(34)/Folder"
						}
					},
					"ParentList": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(34)/ParentList"
						}
					},
					"FileSystemObjectType": 0,
					"Id": 34,
					"Title": "ResearchPg1",
					"Icon": null,
					"Section": "Research",
					"Program": "RSpg1",
					"Page": null,
					"rabbitHole": null,
					"Keywords": {
						"__metadata": {
							"type": "Collection(SP.Taxonomy.TaxonomyFieldValue)"
						},
						"results": []
					},
					"References": {
						"__metadata": {
							"type": "Collection(SP.Taxonomy.TaxonomyFieldValue)"
						},
						"results": []
					},
					"Overview": "### New Page :)\n#### Joy",
					"Policy": null,
					"Training": null,
					"Resources": null,
					"Tools": null,
					"Contributions": null,
					"ContentTypeId": "0x0100B2D3D6C931BB534D9AF1CB0299E7F31B",
					"Link": null,
					"ID": 34,
					"Modified": "2015-09-21T18:16:01Z",
					"Created": "2015-09-21T18:16:01Z",
					"AuthorId": 20950,
					"EditorId": 20950,
					"OData__UIVersionString": "1.0",
					"Attachments": false,
					"GUID": "ca8f224d-1342-4925-a231-7ae28b3c9d96"
				},
				{
					"__metadata": {
						"id": "Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(35)",
						"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(35)",
						"etag": "\"1\"",
						"type": "SP.Data.ContentListItem"
					},
					"FirstUniqueAncestorSecurableObject": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(35)/FirstUniqueAncestorSecurableObject"
						}
					},
					"RoleAssignments": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(35)/RoleAssignments"
						}
					},
					"AttachmentFiles": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(35)/AttachmentFiles"
						}
					},
					"ContentType": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(35)/ContentType"
						}
					},
					"FieldValuesAsHtml": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(35)/FieldValuesAsHtml"
						}
					},
					"FieldValuesAsText": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(35)/FieldValuesAsText"
						}
					},
					"FieldValuesForEdit": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(35)/FieldValuesForEdit"
						}
					},
					"File": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(35)/File"
						}
					},
					"Folder": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(35)/Folder"
						}
					},
					"ParentList": {
						"__deferred": {
							"uri": "https://kx.afms.mil/kj/kx7/PublicHealth/_api/Web/Lists(guid'4522f7f9-1b5c-4990-9704-991725def693')/Items(35)/ParentList"
						}
					},
					"FileSystemObjectType": 0,
					"Id": 35,
					"Title": "Test",
					"Icon": null,
					"Section": "Research",
					"Program": "Test",
					"Page": null,
					"rabbitHole": null,
					"Keywords": {
						"__metadata": {
							"type": "Collection(SP.Taxonomy.TaxonomyFieldValue)"
						},
						"results": []
					},
					"References": {
						"__metadata": {
							"type": "Collection(SP.Taxonomy.TaxonomyFieldValue)"
						},
						"results": []
					},
					"Overview": "### New Page :)\n#### Joy",
					"Policy": null,
					"Training": null,
					"Resources": null,
					"Tools": null,
					"Contributions": null,
					"ContentTypeId": "0x0100B2D3D6C931BB534D9AF1CB0299E7F31B",
					"Link": null,
					"ID": 35,
					"Modified": "2015-09-22T14:35:00Z",
					"Created": "2015-09-22T14:35:00Z",
					"AuthorId": 20950,
					"EditorId": 20950,
					"OData__UIVersionString": "1.0",
					"Attachments": false,
					"GUID": "03579edf-b717-419a-a367-b3b4b34e2669"
				}
			]
		}
	},
	data_ = reduce(data.d.results, function ( obj, item ) {
		obj[item.ID] = { d: item };
		return obj;
	}, {}),
	_spPageContextInfo = {
		webAbsoluteUrl: "https://kx.afms.mil/kj/kx7/PublicHealth"
	},
	// ------
	baseURL = _spPageContextInfo.webAbsoluteUrl,
	sitePath = baseURL + "/_api/lists/getByTitle('Content')",
	digest = document.getElementById("__REQUESTDIGEST").value;

events.on("list.loading", function () {
	/*reqwest({
		url: sitePath + "/items",
		method: "GET",
		type: "json",
		contentType: "application/json",
		withCredentials: true,
		headers: {
			"Accept": "application/json;odata=verbose",
			"text-Type": "application/json;odata=verbose",
			"Content-Type": "application/json;odata=verbose"
		},
		success: function ( data ) {
			events.emit("list.success", data);
		},
		error: function ( error ) {
			console.log("error connecting:", error);
		}
	});*/
	setTimeout(function () {
		events.emit("list.success", data);
	}, 250);
});

events.on("page.loading", function ( path ) {
	console.log("Begin loadPage...");
	if ( !pages[path] ) {
		events.emit("missing", path);
		return false;
	}
	/*reqwest({
		url: sitePath + "/items(" + pages[path].ID + ")",
		method: "GET",
		type: "json",
		contentType: "application/json",
		withCredentials: true,
		headers: {
			"Accept": "application/json;odata=verbose",
			"text-Type": "application/json;odata=verbose",
			"Content-Type": "application/json;odata=verbose"
		},
		success: function ( data ) {
			events.emit("page.loaded", data);
		},
		error: function ( error ) {
			console.log("error connecting:", error);
		},
		complete: function () {
			if ( codeMirror ) {
				setupEditor();
			}
		}
	});*/
	setTimeout(function () {
		events.emit("page.loaded", data_[pages[path].ID]);
	}, 250);
});

module.exports = {
	data: data,
	baseURL: baseURL,
	sitePath: sitePath,
	digest: digest
};

