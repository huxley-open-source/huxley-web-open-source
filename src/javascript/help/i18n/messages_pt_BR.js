/*global module*/

module.exports = {
    'help': {
        'title': 'Ajuda',
        'howCanweHelpMsg1' : 'Prezados, muito obrigado por utilizar o huxley!',
        'howCanweHelpMsg2' :'Nós que fazemos parte da equipe esperamos que ele seja útil no processo de ensino-aprendizado.',
        'howCanweHelpMsg3' :'Este documento descreve como realizar as principais funções no sistema e além de conter uma FAQ, também está dividido de acordo com o papel de cada usuário.',
        'howCanweHelpMsg4' :'Além dessa fonte, temos também uma playlist no youtube com uma série de vídeos que podem ser úteis:',
        'howCanweHelpMsg5' :'http://www.youtube.com/playlist?list=PL4Z4KvihWKj82YZDWEkmsu8U5XIpCiZ7v&feature=c4-feed-u',
        'howCanweHelpMsg6' :'Atenciosamente,',
        'howCanweHelpMsg7' :'Equipe do Huxley'
    },

    'help-topics': {
        'topic-1': 'Tópico 1',
        'teacher-tutorial': 'Tutorial para Professores',
        'admin-tutorial': 'Tutorial para Administradores Institucionais',
        'group': 'Turmas',
        'faq': 'FAQ',
        'profile': 'Perfil'
    },
    'help-pages': {
        'thermometer': 'Termômetro de atividade da turma',
        'poor-performance-students': 'Alunos com mal desempenho no sistema',
        'doubt-of-students': 'Duvidas do aluno',
        'doubt-of-teachers': 'Duvidas do professor',
        'admin' : 'Administradores Institucionais',
        'admin-add-teacher' : 'Adicionar professor a instituição',
        'create-group' : 'Criando uma turma',
        'create-quiz' : 'Criando uma tarefa',
        'create-problem' : 'Criando um problema',
        'profile-institution': 'Instituição de um usuário'
    },
    'help-content': {
        'thermometer1': 'Utiliza como cálculo (quantidade de submissões dos membros da turma)/(quantidade de membros da turma) * 0.3 + (quantidade de acessos dos membros da turma)/(quantidade de membros da turma) * 0.7.',
        'thermometer2': 'Tendo este resultado em mãos, classificamos a atividade da turma como: inativo(se o resultado for 0), pouca atividade(0 < resultado <= 0.2), atividade média(0.2 < resultado <= 0.4) e com muita atividade(resultado > 0.4).',
        'worstReport1': 'Os alunos inseridos nessa lista estão acessando pouco o the huxley ou não estão submetendo muitas soluções. Isso pode significar que ele está com dificuldades no entendimento ou até mesmo desmotivado. É importante entrar em contato com esses alunos para entender o que está havendo e tentar ajudá-lo.',
        'worstReport2': 'Nós consideramos que ele acessa pouco quando o acesso do mesmo está abaixo do acesso médio da turma, e consideramos que ele está submetendo pouco quando o número de submissões está abaixo do número médio de submissões da turma.'
    },
    'faq': {
        'faqTitle1': 'Como é calculado o nível dinâmico (ND)?',
        'faqTitle2': 'Acertei o problema e o nível dinâmico (ND) não mudou, por que?',
        'faqTitle3': 'Quais as possíveis respostas a uma submissão e o que elas significam?',
        'faqTitle4': 'Como o top coder é calculado?',
        'faqTitle5': 'Quando o top coder é recalculado?',
        'faqTitle6': 'Quais os formatos válidos do nome do arquivo que irei submeter?',
        'faqTitle7': 'Posso submeter a minha solução em qual linguagem de programação?',
        'faqTitle8': 'Estou com dúvidas, como peço ajuda?',
        'faqMessage1': 'Essa apresentação detalha o procedimento:',
        'faqMessage2': 'Recalculamos o nível dinâmico de todos os problemas somente uma vez por dia. Atualmente, fazemos isso as 03:00hs da manhã.',
        'faqMessage4': 'Cada vez que você acerta uma questão, você ganha os pontos definidos pelo ND do problema. A sua pontuação total é definida pela soma dos NDs dos problemas que você acertou. Lembre-se que o ND é recalculado diariamente.',
        'faqMessage5': 'Todos os dias as 03:00hs da manhã.',
        'faqMessage6': 'O arquivo não pode conter espaços nem acentos. Além disso, ele precisa ter uma das seguintes extensões: .c, .cpp, .java, .py, .m e .pas',
        'faqMessage7': 'C, C++, Java, Python, Octave e Pascal',
        'faqMessage8': 'Para pedir ajudar envie uma mensagem para o professor da sua turma.',
        'faqLink1': 'https://docs.google.com/presentation/d/1b7BhvSw7Fu2BohUF2WDvbSWnDfKbAEHauipM3QxW9is/edit#slide=id.p',
        'faqTable11': 'CORRECT',
        'faqTable12': 'Seu programa gerou as saídas esperadas',
        'faqTable21': 'WRONG_ANSWER',
        'faqTable22': 'Seu programa não gerou as saídas esperadas',
        'faqTable31': 'PRESENTATION_ERROR',
        'faqTable32': 'As respostas foram corretas, entretanto a saída está com uma formatação diferente da exigida no problema. Geralmente é um espaço sobrando no final de uma linha ou mesmo uma linha a mais (um \n a mais na última linha da sua saída)',
        'faqTable41': 'COMPILATION_ERROR',
        'faqTable42': 'Ocorreu um erro de compilação. Muitas vezes esse erro é causado pelo uso de bibliotecas que não são padrão (veja: www.cplusplus.com)',
        'faqTable51': 'EMPTY_ANSWER',
        'faqTable52': 'Seu programa não gerou nenhuma saída para as entradas que usamos como teste.',
        'faqTable61': 'RUNTIME_ERROR',
        'faqTable62': 'Ocorreu uma falha durante a execução do seu programa.  Muitas vezes é causada por um erro de ponteiros, incompatibilidade de tipos de dados, etc.',
        'faqTable71': 'TIME_LIMIT_EXCEEDED',
        'faqTable72': 'Seu programa não terminou de executar no tempo definido para o problema. Nesse caso:',
        'faqTable81': 'WRONG_FILE_NAME',
        'faqTable82': 'O nome do arquivo que você submeteu é inválido. Elimine espaços e acentos do nome do seu arquivo.',
        'faqTable91': 'HUXLEY_ERROR_110',
        'faqTable92': 'Houve algum problema com a sua submissão que não conseguimos prever a priori. Estamos sempre monitorando esses erros para melhorar a qualidade do nosso avaliador.',
        'faqTableList1': 'Verifique se você não está esperando alguma entrada que nunca vem',
        'faqTableList2': 'Verifique se o seu programa não entra em loop infinito ou em recursão infinita',
        'faqTableList3': 'Tente deixá-lo mais eficiente',
        'faqTitle9': 'Como posso ajudar um aluno com uma submissão errada?',
        'faqMessage9': 'Na lista de submissões da turma, clique em "Visualizar Submissão":',
        'faqMessage91': 'Nessa tela, você verá o caso de entrada que originou a saída não esperada além de ver qual a resposta esperada e qual a resposta obtida pelo código do aluno.'
    },
    'admin-tutorial': {
        'adminTutorial1' : 'O administrador institucional é a pessoa da instituição responsável por controlar quais são os usuários que irão utilizar o huxley. É ele quem distribui as licenças da instituição para os alunos e professores.',
        'adminTutorial2' : 'Passo 1: clique no ícone de configurações. Quando o menu suspenso aparecer, selecione Gerenciar Licenças:',
        'adminTutorial3' : 'Na tela abaixo, (1) clique em membros, (2)  clique em adicionar usuários, (3) escolha professores, (4) escreve o nome dos usuários a serem adicionados como professor, (5) clique em adicionar para adicionar os usuário como professores. Na figura abaixo, esses passos são ilustrados.',
        'adminTutorial4' : 'No início de cada período letivo será necessário cadastrar os novos alunos. Uma prática comum entre os administradores institucionais que utilizam o huxley é fazer esse cadastro em conjunto com os professores das disciplinas. O processo funciona assim:'
    },
    'teacher-tutorial': {
        'createGroup': 'Cadastrando Turma',
        'createGroup1': '(1) Para criar uma turma vá para a página de Turmas',
        'createGroup2': '(2) Clique em criar turma',
        'createGroup3': '(3) Preencha os dados do formulario e clique em Salvar Turma',
        'createQuiz': 'Criando Tarefa',
        'createQuiz1': '(1) Para criar uma tarefa vá a uma turma já existente.',
        'createQuiz2': '(2) Entre na aba de tarefas, (3) selecione novo, (4) preencha os campos, (5) clique em próxima etapa.',
        'createQuiz3': '(6) Procure pelos problemas desejados, (7) selecione o problema.',
        'createProblem': 'Criando Problema',
        'createProblem1': '(1) Clique em problemas e em seguida (2) clique em Criar problema.',
        'createProblem2': '(3) Preencha os campos do formulario e (4) escolhas os tópicos pertencentes ao seu problema.',
        'createProblem3' : '(5) Não esqueça de trocar a aba para preencher a entrada e saida, e (6) adicione fotos caso seja necessário.'
    },
    'profile': {
        'institution': 'Os usuário somente pode exibir em seu perfil, instituições que estejam relacionadas as turmas aos quais ele pertence.'
    }
};