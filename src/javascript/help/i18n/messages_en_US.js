/*global module*/

module.exports = {
    'help': {
        'title': 'Ajuda',
        'howCanweHelpMsg1' : 'Dears, thank you very much for being using the huxley!',
        'howCanweHelpMsg2' :'We that are part of the staff are waiting that it\'s useful on the teaching-learning process.',
        'howCanweHelpMsg3' :'This document describe how to realize some of the main functions of the system and contains a FAQ, also it is divided according the role of each user.',
        'howCanweHelpMsg4' :'Beyond this source, we also have a playlist on youtube with a series o videos that can be useful:',
        'howCanweHelpMsg5' :'http://www.youtube.com/playlist?list=PL4Z4KvihWKj82YZDWEkmsu8U5XIpCiZ7v&feature=c4-feed-u',
        'howCanweHelpMsg6' :'Best regards,',
        'howCanweHelpMsg7' :'Huxley staff'
    },

    'help-topics': {
        'topic-1': 'Topic 1',
        'teacher-tutorial': 'Tutorial for Teacher',
        'admin-tutorial': 'Tutorial for Institutional Admin',
        'group': 'Classes',
        'faq': 'FAQ',
        'profile': 'Profile'
    },
    'help-pages': {
        'thermometer': 'Thermometer of the class activity',
        'poor-performance-students': 'Students with poor performance',
        'doubt-of-students': 'Students doubts',
        'doubt-of-teachers': 'Teachers doubts',
        'admin' : 'Institutional admins',
        'admin-add-teacher' : 'Add teacher to the institution',
        'create-group' : 'Creating a class',
        'create-quiz' : 'Creating an assignment',
        'create-problem' : 'Creating a problem',
        'profile-institution': 'User\'s institution'
    },
    'help-content': {
        'thermometer1': 'Uses as calculation (quantity of submissions of the class members)/(quantity of class members)* 0.3 + (quantity of class members access)/(quantity of class members)* 0.7.',
        'thermometer2': 'Having this result in hands, we classify the activity of the class as: inactive(if the result is 0), low activity (0 < result <= 0.2), average activity(0.2 < result <= 0.4) and with high activity (result > 0.4).',
        'worstReport1': 'The students in this list have low access on the huxley or are not submitting enough. This could mean that he is having difficulties with the understanding or is unmotivated. It\'s important to contact these students to understand what\'s happening and try to help them.',
        'worstReport2': 'We consider that he have low access when the access is below the average access of the class, and consider that he doesn\'t have enough submissions when the number of submissions is below the class average submissions number.'
    },
    'faq': {
        'faqTitle1': 'How is the Dynamic level (DL) calculated?',
        'faqTitle2': 'I got correct on a problem and the dynamic level (DL)  doesn\'t changed?',
        'faqTitle3': 'What are the possible answers of a submission and what it means?Quais as possíveis respostas a uma submissão e o que elas significam?',
        'faqTitle4': 'How the topcoder is calculated?',
        'faqTitle5': 'When the topcoder is recalculated?',
        'faqTitle6': 'What are the available formats and the name of the file that I\'ll submit?',
        'faqTitle7': 'Can I submit my solution in what programming language?',
        'faqTitle8': 'I have a doubt, how I ask for help?',
        'faqMessage1': 'This detailed presentation details the procedure:',
        'faqMessage2': 'We recalculate the dynamic level of all the problems only once a day. Actually, we do it at 03:00am.',
        'faqMessage4': 'Each time you get a question right, you get the score defined by the DL of the problem. The total score is defined by the sum of DLs of the problems you got right. Remember that the ND is recalculate daily.',
        'faqMessage5': 'Everyday at 03:00am.',
        'faqMessage6': 'The file can\'t contain blank spaces nor accent. Also, it must to have one of the following extesions: .c, .cpp, .java, .py, .m e .pas',
        'faqMessage7': 'C, C++, Java, Python, Octave and Pascal',
        'faqMessage8': 'To ask help send a message to the teacher of your class.',
        'faqLink1': 'https://docs.google.com/presentation/d/1b7BhvSw7Fu2BohUF2WDvbSWnDfKbAEHauipM3QxW9is/edit#slide=id.p',
        'faqTable11': 'CORRECT',
        'faqTable12': 'Your program generated the expected output',
        'faqTable21': 'WRONG_ANSWER',
        'faqTable22': 'Your didn\'t program generated the expected output',
        'faqTable31': 'PRESENTATION_ERROR',
        'faqTable32': 'The answers were correct, but the output is with a different format then the expected by the problem. Generally it\'s a blank space in the end of the line or a blank line in the end of the output(a \n at the last line of your output)',
        'faqTable41': 'COMPILATION_ERROR',
        'faqTable42': 'Ocurred a compilation error. Many times this error is caused by the use of non default libraries (see: www.cplusplus.com)',
        'faqTable51': 'EMPTY_ANSWER',
        'faqTable52': 'Your program didn\'t generated an output to the input we used to test.',
        'faqTable61': 'RUNTIME_ERROR',
        'faqTable62': 'Occured and error while executing your program. Many times this is caused by a pointer error, incompatibility of data types, etc.',
        'faqTable71': 'TIME_LIMIT_EXCEEDED',
        'faqTable72': 'Your program didn\'t finished to execute in the time defined for the problem. In this case:',
        'faqTable81': 'WRONG_FILE_NAME',
        'faqTable82': 'The filename you submitted is invalid. Remove blank spaces and accents from the filename.',
        'faqTable91': 'HUXLEY_ERROR_110',
        'faqTable92': 'There was a problem with your submission that we couldn\'t identify. We are always monitoring these errors to improve the quality of our judge.',
        'faqTableList1': 'Verify if your program isn\'t waiting for a non-existent input',
        'faqTableList2': 'Verify if your program doesn\'t have an infinite loop nor an infinite recursion',
        'faqTableList3': 'Try to make it more efficient',
        'faqTitle9': 'How can I help a student with a wrong submission?',
        'faqMessage9': 'In the class submissions list, click in "Visualize submission":',
        'faqMessage91': 'On this screen, you will see the input that originated the not expected output also you will see what\'s the expected output and the received output for the student code.'
    },
    'admin-tutorial': {
        'adminTutorial1' : 'The institutional admin is the person responsible for the institution to control which users will use the huxley. It\'s the person that distribute the licenses of the institution for the students and teachers.',
        'adminTutorial2' : 'Step1: click on the configuration icon. When the dropdown menu appears, select manage licenses:',
        'adminTutorial3' : 'On the screen below, (1) click in members, (2)  click in add user, (3) choose teacher, (4) write the names of the users to be added as teacher, (5) click in add to add the users as teachers. On the image below, the steps are illustrated.',
        'adminTutorial4' : 'At the start of each academic period it will be necessary to registers the news students. A common practice between institutional admins that uses the huxley is to do that register with the teachers os the subjects. The process works like this:'
    },
    'teacher-tutorial': {
        'createGroup': 'Creating a class',
        'createGroup1': '(1) To create a class go the classes page',
        'createGroup2': '(2) Click in Create class',
        'createGroup3': '(3) Fill the data of the form and click in Save class',
        'createQuiz': 'Creating assignment',
        'createQuiz1': '(1) To create an assignment go to an existent class.',
        'createQuiz2': '(2) Enter the assignments tab, (3) select new, (4) fill the data of the form, (5) click in next step.',
        'createQuiz3': '(6) Search for the desired members, (7) select the problem.',
        'createProblem': 'Creating problem',
        'createProblem1': '(1) Go to the problems page then (2) click in Create problem.',
        'createProblem2': '(3) Fill the data of the form and (4) choose the topics that belongs to your problem.',
        'createProblem3' : '(5) Don\'t forget to change tabs and fill the data about input and output, and (6) add photos if necessary.'
    },
    'profile': {
        'institution': 'The user can only display on their profile, institutions that they are related through the classes they are in.'
    }
};