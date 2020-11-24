/*global module*/

module.exports = {
    'group': {
        'chart': 'Graphs',
        'config': 'Config',
        'configs': {
            'edit': 'Edit',
            'key': 'Key'
        },
        'statsAlert': 'The following charts are based on submissions during the activity period.',
        'stats' : {
            'label': 'Stats',
            'data': {
                'students': 'Students',
                'teacherAssistant': 'Teacher Assistants',
                'submissionsCount': 'Number of submissions',
                'submissionsCorrect': 'Number of correct submissions',
                'problemsTried': 'Problems tried',
                'problemsTriedAverage': 'Average tried problems',
                'problemsSolved': 'Problems solved',
                'problemsSolvedAverage': 'Average solved problems',
                'submissionByEvaluation': 'Submissions by evaluation',
                'submissionByLanguage': 'Submissions by language',
                'problemsByND': 'Problems by ND',
                'problemsByTopic': 'Problems by topic'
            }
        },
        'create': {
            'button': 'CREATE CLASS',
            'title': 'Creating class',
            'passOne': 'First step',
            'teacher': 'Teacher(s)',
            'teacherAssistant': 'Teacher assistant(s)',
            'description': 'Description',
            'institution': 'Institution',
            'name': 'Class name',
            'nameUniqueError': 'Name already in use',
            'nameRequired': 'The class name is required',
            'characterCount': '{{count}} remaining of {{total}} characters',
            'characterCountError': 'The total of characters was trespassed',
            'descriptionPopover': 'Write a description for your grup!',
            'namePopover': 'Choose a name for your class, the name must be unique',
            'urlPopover': 'Choose a url for your class, the url must be unique',
            'teacherPopover': 'Type the name of a user and choose one of the options listed, it\'s possible to choose more than once',
            'teacherEmpty': 'Choose at least one teacher',
            'url': 'URL',
            'urlInvalidError': 'Invalid URL',
            'urlUniqueError': 'URL already used',
            'urlRequired': 'The URL is required',
            'urlRoot': 'http://thehuxley.com/groups/',
            'startDateGreater': 'The initial date must be greater than the final date',
            'save': 'Save class',
            'error': 'Wasn\' possible to save',
            'saved': 'Changes saved'
        },
        'description': 'Description',
        'description.icon' : 'D',
        'endDate' : 'Final date',
        'hide': 'hide',
        'institution' : 'Institution',
        'institution.icon' : 'I',
        'invitesSended': 'Invites send',
        'usersAdded': 'Users added',
        'invalidUser': 'Invalid user/e-mail',
        'invitesFail': 'There was an error when inviting',
        'userName': 'User',
        'questEmpty': 'No assignments found for this class',
        'submissionsEmpty': 'No submissions found',
        'noActiveGroup': 'No active class found',
        'key': {
            'tip': 'TYPE THE KEY',
            'tip.msg': 'Type the access key Digite sua chave de acesso na caixa ao lado.',
            'insert.msg': 'INSERT THE ACCESS KEY',
            'group': 'This key will turn you member of this class',
            'invalid': 'Invalid key',
            'invalid.msg': 'No class found.',
            'confirm': 'Confirm',
            'explanation': 'This access key allow the users to enter this class.',
            'generate': 'Generate access key',
            'reGenerate': 'Regenerate',
            'copyInfo': 'CTRL + C to copy the selection',
            'error': 'The user is already a member of the class.'
        },
        'license': {
            'reportPt1': 'Hello! You still don\'t have',
            'reportPt2': 'licenses of',
            'button': 'Purchase licenses'
        },
        'list': {
            'title': 'Class list'
        },
        'visualize': 'visualize',
        'members': 'Members',
        'myGroups': 'MY CLASSES',
        'questionnaire': 'Assignments',
        'orderByUpdate': 'Order by update',
        'participation': {
            'request': 'Would you like to join this class?',
            'button': 'Request Entry'
        },
        'pendencies': {
            'accept': 'Accept',
            'index': 'Pendencies',
            'reject': 'Reject',
            'acceptSelected': 'Accept the selected members',
            'rejectSelected': 'Reject the selected members',
            'accepted': 'Accepted'
        },
        'problemName' : 'Problem',
        'quest' : {
            'list': 'List'
        },
        'results': 'RESULTS',
        'search': 'SEARCH CLASS',
        'searchAllGroupsMsg': 'Search in all classes',
        'submissions': {
            'date': 'date',
            'name': 'name',
            'problem': 'Problem',
            'evaluation': 'Evaluation',
            'visualize': 'Visualize',
            'search': 'Search Submissions',
            'reevaluate': 'Reevaluate'
        },
        'startDate' : 'Start Date',
        'lastUpdated': 'Last activity register: {{date | date:"dd/MM/yyyy"}}',
        'resultNotFound': 'Class not found',
        'withoutGroup': 'You don\'t have classes',
        'teacher' : 'Teacher',
        'teacher.assistant': 'Teacher Assistant',
        'teacher.icon' : 'P',
        'teacher.assistant.icon': 'M',
        'title': 'Classes',
        'users': {
            'confirmRemove': 'Are you sure you want to remove the selected user from the class?',
            'confirmRemoveSelected': 'Are you sure you want to remove the selected(s) student(s) from the class?',
            'yes': 'Yes',
            'cancel': 'Cancel',
            'selectAll': 'Select All',
            'exclude': 'Remove from class',
            'sendMessage': 'Send message',
            'undo': 'Undo',
            'addStudent': 'Add students',
            'addTeacher': 'Add teachers',
            'addTeacherAssistant': 'Add teacher assistants',
            'addStudentText': 'Add students in this class',
            'addTeacherText': 'Add teachers in this class',
            'addTeacherAssistantText': 'Add teacher assistant in this class'
        },
        'submission': 'Submissions',
        'alertMsgs' : {
            'msg1' : 'Still no a member of any class?<br><br>Request acces to one of your interest' +
                ' or wait to be invited by a teacher!<br>',
            'msg2' : 'On the Classes page you can: <br><br> Search for a specific class of your interest.<br>' +
                '<br> Have acces to your classes and the listing of all classes registered on The Huxley.' +
                '<br><br> Register yourself as a member of a class through a token key.',
            'msg3' : 'No submissions were done by the members of this class.',
            'msg4' : 'No submissions were done during this assignment.'
        },
        'newGroup': {
            'msg1': 'Congratulations, the class was successfully created!!',
            'msg2': 'To start the activities ',
            'addMember1': 'add members',
            'addMember2': 'add members',
            'createQuest': 'create assignments',
            'createQuest2': 'create assignment',
            'keyMsg': 'You also can share this key with your students'
        },
        'newQuest': {
            'msg1': 'This class still doesn\'t have assignments',
            'msg2': 'Assignments are a way of encourage the practice of the students, don\'t forget to',
            'msg3': 'The class that this assignment is part of doesn\'t have students. ',
            'createQuest': 'create assignment'
        },
        'send': 'send',
        'add': 'add',
        'yes': 'yes',
        'no': 'no',
        'delete': {
            'msg': 'Are you sure you want to close the class?',
            'explanation': 'Once the class is closed, it will be suspended until the teacher reopen it. The class will still be available for consultation, but the functions will be restricted.'
        },
        'quiz': {
            'confirmRemove': 'Are you sure you want to delete the assignment?'
        },
        'topcoder': 'CLASS TOPCODER',
        'charts': {
            'students' : 'Students',
            'quizzes' : 'Assignment',
            'yAxisLabel' : 'Quantity of students that have submissions and the quantity of open assignments on the interval',
            'xAxisLabel' : 'Date',
            'submissionChartTitle' : 'Submissions graph',
            'submisionChartSubtitle' : 'The graph represents the number of students that submitted in a period of time'
        },
        'statsList': {
            'name': 'Name',
            'alert': 'The stats are based on the submissions sent during the period of the class, except the information about topcoder score and position',
            'groupPosition': 'TC (Class)',
            'topcoderPosition': 'TC (General)',
            'problemsTried': 'Problems Tried',
            'problemsSolved': 'Problems Solved',
            'points': 'Score',
            'submissions': 'Submissions',
            'poorPerformance': 'Value so low compared with the values of the class',
            'poorHitRate': 'This student seems to be having difficulties with the problems resolution',
            'visualize': 'Visualize',
            'topcoderGroupPosition': 'Class position',
            'topcoderPosition': 'Topcoder position',
            'points': 'Score',
            'general': 'General',
            'list': 'Students',
            'visualize': 'Visualize'
        },
        'quiz': {
            'import': 'import'
        }
    }
};