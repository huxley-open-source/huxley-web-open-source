/*global module*/

module.exports = {
    'group': {
        'chart': 'Gráficos',
        'config': 'Configuração',
        'configs': {
            'edit': 'Editar',
            'key': 'Chave'
        },
        'statsAlert': 'As estatísticas mostradas nos gráficos a seguir são baseadas nas submissões enviadas durante o prazo da tarefa.',
        'stats' : {
            'label': 'Estatísticas',
            'data': {
                'students': 'Alunos',
                'teacherAssistant': 'Monitores',
                'submissionsCount': 'Número de Submissões',
                'submissionsCorrect': 'Numero de Submissões Corretas',
                'problemsTried': 'Problemas Tentados',
                'problemsTriedAverage': 'Média de Problemas Tentados',
                'problemsSolved': 'Problemas Solucionados',
                'problemsSolvedAverage': 'Média de Problemas Solucionados',
                'submissionByEvaluation': 'Submissões por avaliação',
                'submissionByLanguage': 'Submissões por linguagem',
                'problemsByND': 'Problemas por ND',
                'problemsByTopic': 'Problemas por tópico'
            }
        },
        'create': {
            'button': 'CRIAR TURMA',
            'title': 'Criando uma turma',
            'passOne': 'Primeiro passo',
            'teacher': 'Professor(es)',
            'teacherAssistant': 'Monitor(es)',
            'description': 'Descrição',
            'institution': 'Instituição',
            'name': 'Nome da turma',
            'nameUniqueError': 'Nome em uso',
            'nameRequired': 'O nome da turma não pode ficar em branco',
            'characterCount': 'Restam {{count}} de {{total}} caracteres',
            'characterCountError': 'O total de caracteres foi ultrapassado',
            'descriptionPopover': 'Escreva uma descrição para a sua turma!',
            'namePopover': 'Escolha um nome para a sua turma, o nome deve ser único',
            'urlPopover': 'Escolha uma url para a sua turma, a url deve ser única',
            'teacherPopover': 'Digite o nome de um usuário e escolha uma das opções da lista, é possível escolher mais de uma vez',
            'teacherEmpty': 'Escolha pelo menos um professor',
            'url': 'URL',
            'urlInvalidError': 'URL inválida',
            'urlUniqueError': 'URL em uso',
            'urlRequired': 'A URL não pode ficar em branco',
            'urlRoot': 'http://thehuxley.com/groups/',
            'startDateGreater': 'A data inicial não pode ser maior que a final',
            'save': 'Salvar turma',
            'error': 'Não foi possível salvar',
            'saved': 'Alterações salvas'
        },
        'description': 'Descrição',
        'description.icon' : 'D',
        'endDate' : 'Data Final',
        'hide': 'esconder',
        'institution' : 'Instituição',
        'institution.icon' : 'I',
        'invitesSended': 'Convites enviados',
        'usersAdded': 'Usuários adicionados',
        'invalidUser': 'Usuário/e-mail inválido(s)',
        'invitesFail': 'Houve um erro na hora de enviar os convites',
        'userName': 'Usuário',
        'questEmpty': 'Não foram encontradas tarefas para essa turma',
        'submissionsEmpty': 'Não foram encontradas submissões',
        'noActiveGroup': 'Nenhuma turma ativa encontrada',
        'key': {
            'tip': 'DIGITE A CHAVE',
            'tip.msg': 'Digite sua chave de acesso na caixa ao lado.',
            'insert.msg': 'INSERIR CHAVE DE ACESSO',
            'group': 'Esta chave lhe tornará membro da seguinte turma',
            'invalid': 'Chave Inválida',
            'invalid.msg': 'Nenhuma turma foi encontrada.',
            'confirm': 'Confirmar',
            'explanation': 'A chave de acesso permite o cadastro automático de membro da turma a que se relaciona.',
            'generate': 'Gerar chave de acesso',
            'reGenerate': 'Repetir',
            'copyInfo': 'CTRL + C para copiar seleção',
            'error': 'Usuário já é membro da turma.'
        },
        'license': {
            'reportPt1': 'Olá! Você ainda possui',
            'reportPt2': 'licenças de',
            'button': 'Adquirir licenças'
        },
        'list': {
            'title': 'Lista de turma'
        },
        'visualize': 'visualizar',
        'members': 'Membros',
        'myGroups': 'MINHAS TURMAS',
        'questionnaire': 'Tarefas',
        'orderByUpdate': 'Exibir por ordem de atualizações',
        'participation': {
            'request': 'Gostaria de se juntar a turma?',
            'button': 'Solicitar Entrada'
        },
        'pendencies': {
            'accept': 'Aceitar',
            'index': 'Pendências',
            'reject': 'Rejeitar',
            'acceptSelected': 'Aceitar membros selecionados',
            'rejectSelected': 'Recusar membros selecionados',
            'accepted': 'Aceito'
        },
        'problemName' : 'Problema',
        'quest' : {
            'list': 'Lista'
        },
        'results': 'RESULTADOS',
        'search': 'BUSCAR TURMA',
        'searchAllGroupsMsg': 'Pesquisar em todos as turmas',
        'submissions': {
            'date': 'Data',
            'name': 'Nome',
            'problem': 'Problema',
            'evaluation': 'Avaliação',
            'visualize': 'Visualizar',
            'search': 'Buscar submissões',
            'reevaluate': 'Reavaliar'
        },
        'startDate' : 'Data Inicial',
        'lastUpdated': 'Último registro de atividades: {{date | date:"dd/MM/yyyy"}}',
        'resultNotFound': 'Turma não encontrada',
        'withoutGroup': 'Você não possui turmas',
        'teacher' : 'Professor',
        'teacher.assistant': 'Monitor',
        'teacher.icon' : 'P',
        'teacher.assistant.icon': 'M',
        'title': 'Turmas',
        'users': {
            'confirmRemove': 'Tem certeza que deseja excluir esse aluno da turma?',
            'confirmRemoveSelected': 'Tem certeza que deseja excluir o(s) aluno(s) selecionado(s) da turma?',
            'yes': 'Sim',
            'cancel': 'Cancelar',
            'selectAll': 'Selecionar todos',
            'exclude': 'Excluir da turma',
            'sendMessage': 'Enviar mensagem',
            'undo': 'Desfazer',
            'addStudent': 'Adicionar alunos',
            'addTeacher': 'Adicionar professores',
            'addTeacherAssistant': 'Adicionar monitores',
            'addStudentText': 'Convide alguns alunos para fazer parte desta turma',
            'addTeacherText': 'Adicione alguns professores para fazer parte desta turma',
            'addTeacherAssistantText': 'Adicione alguns monitores para fazer parte desta turma'
        },
        'submission': 'Submissões',
        'alertMsgs' : {
            'msg1' : 'Ainda não é membro de nenhuma turma?<br><br>Solicite sua participação em uma turma de seu' +
                ' interesse ou aguarde o convite de um professor!<br>',
            'msg2' : 'Na página de Turmas você poderá: <br><br> Buscar por uma turma específica de seu interesse.<br>' +
                '<br> Ter acesso as suas turmas pessoais e a lista geral de turmas cadastradas no sistema Huxley.' +
                '<br><br> Cadastrar-se como membro de uma turma através de uma chave de acesso.',
            'msg3' : 'Nenhuma submissão foi efetuada pelos alunos por dessa turma.',
            'msg4' : 'Nenhuma submissão foi efetuada durante essa tarefa.'
        },
        'newGroup': {
            'msg1': 'Parabéns, esta turma foi criado com sucesso!!',
            'msg2': 'Para dar início as atividades ',
            'addMember1': 'adicione membros',
            'addMember2': 'adicionar membros',
            'createQuest': 'crie tarefa',
            'createQuest2': 'criar tarefa',
            'keyMsg': 'Você também pode compartilhar esta chave com seus alunos'
        },
        'newQuest': {
            'msg1': 'Essa turma ainda não possui tarefas',
            'msg2': 'Tarefas são uma forma de estimular a prática dos alunos, não esqueça de',
            'msg3': 'A turma a qual essa tarefa está relacionada não possui alunos. ',
            'createQuest': 'criar tarefa'
        },
        'send': 'enviar',
        'add': 'adicionar',
        'yes': 'sim',
        'no': 'não',
        'delete': {
            'msg': 'Tem certeza que deseja encerrar as atividades da turma?',
            'explanation': 'Uma vez encerradas as atividades da turma, este permanecerá suspenso até que o professor opte por reativa-lo. A turma continuará disponível para consulta, porém com suas funções restringidas.'
        },
        'quiz': {
            'confirmRemove': 'Você tem certeza que deseja deletar a tarefa?'
        },
        'topcoder': 'TOPCODER DA TURMA',
        'charts': {
            'students' : 'alunos',
            'quizzes' : 'Tarefas',
            'yAxisLabel' : 'Quantidade de alunos que submeteram e tarefas abertas no período',
            'xAxisLabel' : 'Data',
            'submissionChartTitle' : 'Grafico de Submissões',
            'submisionChartSubtitle' : 'Gráfico que representa o número de alunos que submeteram questões num período de tempo'
        },
        'statsList': {
            'name': 'Nome',
            'alert': 'As estatísticas são baseadas nas submissões enviadas durante o período da turma, salvo as informações relativas a pontuação e a posição do topcoder',
            'groupPosition': 'TC (Turma)',
            'topcoderPosition': 'TC (Geral)',
            'problemsTried': 'Problemas Tentados',
            'problemsSolved': 'Problemas Resolvidos',
            'points': 'Pontuação',
            'submissions': 'Submissões',
            'poorPerformance': 'Valor muito abaixo em comparação com os da turma',
            'poorHitRate': 'Esse aluno parece estar tendo dificuldades em resolver problemas',
            'visualize': 'Visualizar',
            'topcoderGroupPosition': 'Posição na turma',
            'topcoderPosition': 'Posição no Topcoder',
            'points': 'Pontuação',
            'general': 'Geral',
            'list': 'Alunos',
            'visualize': 'Visualizar'
        },
        'quiz': {
            'import': 'importar'
        }
    }
};