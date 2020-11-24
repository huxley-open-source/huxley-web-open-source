/*global module*/

module.exports = {
    'quiz': {
        'student': 'Estudante',
        'quizImport' : 'Importar tarefas',
        'codeCompare': 'Comparar submissões',
        'restrictions': {
            'title': 'Restrições de código',
            'function': {
                'add': 'Adicionar função',
                'exist': 'Existência de função',
                'name': 'Nome',
                'return': 'Retorno',
                'recursive': 'Recursiva',
                'parameters': 'Parâmetros',
                'none': 'Nenhuma função cadastrada',
                'call': 'Chamada de função',
                'must_be': 'Deve possuir/ser',
                'exist': 'Existir',
                'call': 'Ser chamada',
                'list': 'Funções'
            },
            'ifs': 'Desvios condicionais',
            'fors': 'Laços (for)',
            'whiles': 'Laços (while)',
            'list': 'Lista',
            'dict': 'Dicionário',
            'tuple': 'Tupla',
            'empty': 'Impedir blocos vazios',
            'penalty': 'Penalidade'
        },

        'clone': {
            'title': 'Clonar Tarefa',
            'chooseGroup': 'Turma',
            'error': {
                'groupOpenNotFound': 'Você não possui turmas'
            }

        },
        'import': {
            'title': 'Importar',
            'choose': 'Escolha alguma tarefa para importar.',
            'chooseQuiz': 'Escolha quais tarefas deseja importar',
            'availableGroups': 'Turmas disponíveis',
            'chooseGroups': 'Escolha para quais turmas as tarefas serão importados',
            'help': 'A duração das tarefas será mantida, também serão mantidos os intervalos entre as tarefas e as suas horas de inicio e fim. As tarefas importados serão adicionados por ordem das suas datas iniciais.',
            'chosen': 'Tarefas escolhidos',
            'noGroups': 'Essa turma não possui tarefas',
            'confirm': 'Tarefas que serão importadas',
            'quizTitle': 'Título da tarefa'
        },
        'partial': 'Cálculo de nota parcial',
        'closed': 'Encerrado',
        'confirmSimilarity': 'Confirmar',
        'create': 'Criar tarefa',
        'edit': 'Editar',
        'end': 'Termina em: {{end}}',
        'endSimple' : 'Fim',
        'info': '{{total}} tarefas. {{open}} abertas e {{close}} fechados',
        'list': 'Lista',
        'suggestCreate': 'Ainda não possui um tarefa cadastrada?',
        'suggestCreate2': 'Deseja criar uma tarefa?',
        'start': 'Início em: {{start}}',
        'title': 'Tarefas',
        'singleTitle': 'Tarefa',
        'myQuizzes': 'MINHAS TAREFAS',
        'resultNotFound': 'Nenhuma tarefa encontrada.',
        'startSimple' : 'Início',
        'save': 'Salvar',
        'explanation': {
            'emptyProblemList': 'Esta tarefa não possui uma lista de problemas e portanto não ficará disponível aos alunos',
            'questClosed': 'Esta tarefa só estará visível aos alunos a partir da data de início',
            'questOpen': 'Tarefa vísivel aos alunos'
        },
        'score': 'Pontuação',
        'problemList' : 'Lista de problemas',
        'submissionList' : 'Lista de submissões',
        'editProblems' : 'Editar',
        'quizOnly': 'Apenas problemas de prova',
        'presentOnlyHelp': 'Alunos presentes são aqueles que acessaram a página da tarefa durante o período de vigência do mesmo',
        'create': {
            'tab': 'Novo',
            'availableProblems': 'Problemas disponíveis segundo os parâmetros de busca',
            'chosenProblems': 'Problemas escolhidos:',
            'totalPoints': 'Total de pontos atribuidos a esta tarefa:',
            'assignPoints': 'Pontuação:',
            'title': 'Título',
            'titlePlaceholder': 'Crie aqui o título do sua tarefa',
            'startDate': 'Data de início:',
            'datePlaceholder': 'DD/MM/AA',
            'endDate': 'Data de encerramento:',
            'description': 'Descrição:',
            'descriptionPlaceholder': 'Descrição da turma em até 112 caracteres',
            'next': 'Próxima etapa >>',
            'error': {
                'titleRequired': 'O título da tarefa não pode ficar vazio',
                'required': 'Esse campo não pode ficar vazio'
            },
            'alert1': 'Adicione problemas a tarefa. Inicie uma busca dos problemas em nosso banco de dados.',
            'alert2': 'Adicione um problema para começar...',
            'saved': 'Alterações salvas com sucesso',
            'saving': 'Salvando...'
        },
        'presentOnly': 'Apenas alunos presentes',
        'lists': {
            'searchQuiz': 'BUSCAR TAREFA',
            'quizTitle': 'Título',
            'quizScore': 'Pontuação',
            'quizTime': 'Prazo',
            'start': 'Início em',
            'started': 'Iniciou a',
            'end': 'Encerra ',
            'ended': 'Encerrou '
        },
        'advancedSearch': {
            'nameLabel': 'Filtrar por nome:',
            'namePlaceholder': 'Digite o nome da tarefa aqui...',
            'dateLabel': 'Filtrar por período de encerramento:',
            'start': 'De:',
            'end': 'Até:'
        },
        'scores': 'Notas',
        'reviews' : 'Revisões',
        'reviewList': 'Listar',
        'reviewUser': 'Visualizar',
        'numberOfProblems' : 'Esta tarefa possui {{number}} problemas.',
        'studentsSolved': 'Indicador de quantos alunos desta turma resolveram o problema',
        'similarity' : {
            'suspect' : 'Aluno suspeito',
            'firstToSubmit' : 'Primeiro a submeter',
            'view' : 'VISUALIZAR SIMILARIDADE',
            'hide' : 'OCULTAR SIMILARIDADE',
            'drop' : "Cancelar",
            'at': 'às',
            'confirmed': 'CONFIRMADA PELO PROFESSOR',
            'discarded': 'DESCARTADA PELO PROFESSOR',
            'waiting': 'AGUARDANDO',
            'similarity':'Similaridade',
            'confirmSimilarity': 'Confirmar suspeita?',
            'notFound': 'Não foram encontradas similaridades'
        },
        'review': {
            'resetScore': 'Zerar Nota',
            'score': 'Nota',
            'stats': 'Status',
            'view': 'VISUALIZAR SUBMISSÕES',
            'codeTry': 'Tentativa',
            'exportCode': 'Exportar Código',
            'send': 'enviar'
        },
        'greater' : 'Acertaram mais de 70%',
        'smaller' : 'Acertaram menos de 70%',
        'notCorrect' : 'Submissões erradas',
        'correct': 'Submissões corretas',
        'submissionsCount' : 'Total de submissões',
        'submissionsAvgPerDay' : 'Média de submissões por dia',
        'studentsTried' : 'Tentaram resolver',
        'studentsNotTried' : 'Não tentaram resolver',
        'gradeThreshold' : 'Nota azul acima de',
        'scoreChanged' : 'Nota alterada pelo professor',
        'restrictionPenalty': 'Penalidade aplicada por violar restrição',
        'quizSaved': 'Tarefa salva com sucesso',
        'quizStatsMsg' : 'As estatísticas mostradas nos gráfico a seguir são baseadas nas submissões enviadas durante o prazo da tarefa',
        'export' : 'Exportar(xls)',
        'searchByGrades': 'Ordenar por nota',
        'partialScore': 'O cálculo de notas parcial leva em consideração a quantidade de casos de testes corretos na avaliação de um problema. Ou seja, a nota do aluno é proporcional a quantidade de casos de testes corretos.'

    }
};