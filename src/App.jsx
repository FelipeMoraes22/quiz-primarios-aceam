import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, onSnapshot, query, orderBy, doc, setDoc } from 'firebase/firestore';

// ============================================================================
// Configuração do Firebase via variáveis de ambiente (.env)
// ============================================================================
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Gabarito Oficial
const QUESTIONS = [
  { id: 1, text: "Quem era Zaqueu?", options: ["A) Pastor de ovelhas", "B) Pescador", "C) Cobrador de impostos", "D) Carpinteiro"], answer: "C) Cobrador de impostos" },
  { id: 2, text: "Quem eram os filhos de Adão e Eva?", options: ["A) Moisés e Noé", "B) Caim e Abel", "C) Jacó e Esaú", "D) Pedro e João"], answer: "B) Caim e Abel" },
  { id: 3, text: "Quem chamou os primeiros discípulos para segui-Lo?", options: ["A) Um pescador desconhecido", "B) Jesus", "C) Um sacerdote", "D) João Batista"], answer: "B) Jesus" },
  { id: 4, text: "Quantos dias e noites choveu durante o diluvio?", options: ["A) 7 dias e 7 noites", "B) 30 dias e 30 noites", "C) 40 dias e 40 noites", "D) 10 dias e 10 noites"], answer: "C) 40 dias e 40 noites" },
  { id: 5, text: "Por que Jacó enviou José para procurar os irmãos?", options: ["A) Porque queria notícias deles e dos rebanhos", "B) Porque queria que José viajasse sozinho", "C) Porque queria vender animais", "D) Porque José estava perdido"], answer: "A) Porque queria notícias deles e dos rebanhos" },
  { id: 6, text: "Quem era a esposa de Elimeleque?", options: ["A) Sara", "B) Eva", "C) Noemi", "D) Rebeca"], answer: "C) Noemi" },
  { id: 7, text: "José foi levado para qual país como escravo?", options: ["A) Egito", "B) Canaã", "C) Babilônia", "D) Roma"], answer: "A) Egito" },
  { id: 8, text: "O que Deus prometeu a Abraão que ele teria?", options: ["A) Uma família muito grande", "B) Um grande castelo", "C) Muitas riquezas", "D) Muitos exércitos"], answer: "A) Uma família muito grande" },
  { id: 9, text: "O que Jesus fez para mostrar que tinha autoridade para perdoar pecados?", options: ["A) Mandou todos saírem da casa", "B) Pediu que os amigos voltassem", "C) Foi embora sem falar com o homem", "D) Curou o paralítico e mandou que se levantasse"], answer: "D) Curou o paralítico e mandou que se levantasse" },
  { id: 10, text: "Como Isaque estava quando decidiu dar a bênção?", options: ["A) Jovem e forte", "B) Doente e fraco", "C) Idoso e cego", "D) Alegre e saudável"], answer: "C) Idoso e cego" },
  { id: 11, text: "Quem recebeu primeiro a notícia do nascimento de Jesus no campo?", options: ["A) Os sacerdotes", "B) Os sábios do Oriente", "C) Os pastores", "D) O rei Herodes"], answer: "C) Os pastores" },
  { id: 12, text: "Onde Abrão morava antes de obedecer ao chamado de Deus?", options: ["A) Egito", "B) Canaã", "C) Ur", "D) Jerusalém"], answer: "C) Ur" },
  { id: 13, text: "Como José agiu na prisão?", options: ["A) Ficou bravo com todos", "B) Continuou confiando em Deus e ajudando as pessoas", "C) Fugiu da prisão", "D) Não quis conversar com ninguém"], answer: "B) Continuou confiando em Deus e ajudando as pessoas" },
  { id: 14, text: "Em qual cidade Jesus cresceu?", options: ["A) Belém", "B) Nazaré", "C) Jerusalém", "D) Cafarnaum"], answer: "B) Nazaré" },
  { id: 15, text: "Onde Eliézer parou com os camelos ao chegar na cidade?", options: ["A) No mercado", "B) No portão da cidade", "C) Perto de um poço", "D) Dentro de uma casa"], answer: "C) Perto de um poço" },
  { id: 16, text: "Quem avisou José para proteger o menino Jesus?", options: ["A) Um anjo de Deus", "B) Maria", "C) Um pastor", "D) O rei Herodes"], answer: "A) Um anjo de Deus" },
  { id: 17, text: "Quem saiu da cidade de Ur para seguir a Deus?", options: ["A) Moisés e Arão", "B) Abrão e Sarai", "C) Davi e Jônatas", "D) Pedro e João"], answer: "B) Abrão e Sarai" },
  { id: 18, text: "Quem foi andando sobre as águas até o barco?", options: ["A) Pedro", "B) André", "C) João", "D) Jesus"], answer: "A) Pedro" },
  { id: 19, text: "Por que José era tão especial para Jacó?", options: ["A) Porque era o filho de Raquel e nasceu quando Jacó era idoso", "B) Porque era o mais forte", "C) Porque cuidava melhor dos animais", "D) Porque era o mais velho"], answer: "A) Porque era o filho de Raquel e nasceu quando Jacó era idoso" },
  { id: 20, text: "O que Jesus queria que Seus discípulos compartilhassem?", options: ["A) O amor de Deus", "B) Somente comida para eles mesmos", "C) Somente seus brinquedos", "D) Somente suas riquezas"], answer: "A) O amor de Deus" }
];

const DISTRICTS = {
  "ACeAm": ["Associação Central Amazonas"],
  "Alphaville": ["Alphaville"],
  "Alto Solimões": ["Amaturá", "Castanha", "Estrela da Manhã", "Japiim - Alto Solimões", "Missão", "Santo Antônio do Iça - Central", "Santo Antonio do Içá- Independência", "Santo Antônio do Içá - Planalto", "Santo Antônio do Içá - São José", "São Paulo de Olivença - Bairro Novo", "São Paulo de Olivença - Central", "São Paulo de Olivença - Colônia", "São Paulo de Olivença - São Joaquim", "Tonantins", "Tonantins José Cordeira", "Tonantins - São Francisco"],
  "Alvorada I": ["Alvorada I", "Alvorada VI"],
  "Alvorada II": ["Alvorada III", "Alvorada IV", "Alvorada V", "Alvorada VII", "Franceses"],
  "Benjamin Constant": ["Atalaia do Norte", "Benjamin Constant", "Bom Caminho", "Bom Jardim - Benjamin Constant", "Cidade Nova", "Eduardo Braga - Benjamin Constant", "Luzeiros", "Maranata - Benjamin Constant", "Nova Prosperidade", "Porto Amélia", "São Francisco Benjamin Constant", "São João da Veneza", "Sapotal", "Umarizal"],
  "Cachoeirinha": ["Beth B'nei Tsion", "Cachoeirinha"],
  "Carauari I": ["Adonai", "Alfa - Central", "Bauana", "Comunidade Indigena Taquara", "Eduardo Braga", "Flutuante", "Igarapé da Roça", "Kadesh", "Km 7- Carauari", "Morumbi II", "Nova Esperança - Carauari", "Pupuai", "Ramalhão", "Vila Ramalho"],
  "Carauari II": ["14 Bis", "Agape", "Bairro da Luz", "Conjunto da Caixa", "El Shaday - Carauari", "Jerusalém - Carauari", "Lago Preto", "Memória", "Nova Republica - Carauari", "Ponte do Futuro", "Samuel Amaral - Central"],
  "Castelo do Rei": ["Castelo do Rei", "Manaus Moderna", "Monte Castelo"],
  "Central Manaus": ["Central de Manaus", "General Glicério"],
  "Coari I": ["Arapari", "Ariri", "Árvore da Vida", "Coari - Central", "Coari IV", "Coari IX", "Coari VII", "Duque de Caxias", "Esperança Viva - Coari", "Liberdade - Coari", "Marajó", "Martelo", "Monte das Oliveira", "Pera", "Renovação", "Terra Nova", "Tibian", "Vila Monteiro", "Vista Alegre"],
  "Coari II": ["Assim Diz O Senhor", "Coari II - Central", "Coari III- Urucu", "Coari V - União", "Coari VIII", "Coari X", "Coari XI", "Coari XII", "Itapéua", "Jussara", "Mamiá", "Maranata Coari II", "Monte Sião - Coari", "Nazare Pinheiro II", "Nova República", "Saubinha Coari", "Trocaris", "Vale da Bênção", "Vila Comara"],
  "Codajás": ["Anamä", "Anori", "Arixi Codajás", "Bairro Novo - Codajás", "Bela Vista - Codajás", "Benfica", "Bom Jesus", "Codajás - Central", "Colônia", "Grande Vitória", "IASD do Castanhal", "lauara", "Murituba", "Nova Conquista - Codajás", "São Carlos", "Tapira", "Vila Nova", "Vila Raimunda"],
  "Compensa I": ["Compensa I", "Compensa IV", "Compensa IX", "Compensa VI", "Compensa XI"],
  "Compensa II": ["Compensa II", "Compensa VIII", "Compensa X", "Compensa XIII", "Compensa XIV"],
  "Compensa III": ["Cidade Nova - Compensa III", "Compensa III", "Compensa V", "Compensa VII", "Compensa XII", "Mutirão do Cacau", "Nova Veneza"],
  "Dom Pedro": ["Alvorada II", "Chapada", "Dom Pedro I", "Dom Pedro II", "Promorar"],
  "Educandos": ["A Grande Esperança - Educandos", "Aparecida", "Colonia Oliveira Machado", "Comunidade Ágape", "Educandos", "Esperança Viva - Educandos", "Praça 14"],
  "Eirunepé": ["Ame", "Beija - Flor", "Eirunepe - Central", "Envira", "Envira II", "Envira III", "Getsemani - Eirunepé", "Getsemani II", "Monte Sião", "Nova Venezuela", "Videira", "Vila Cacau"],
  "Fonte Boa": ["Ebenézer - Fonte Boa", "Fonte Boa Central", "Fonte Boa II", "Fonte Boa III", "Fonte Boa IV", "Jutai Bom Pastor", "Jutai Central", "Jutaí São José", "Mãos Que Ajudam"],
  "Iranduba I": ["Bairro Alto", "Chisa", "Costa de Iranduba", "Iranduba - Central", "Iranduba III", "Montenegro", "Nova Esperança - Iranduba", "Nova Geração de Cristo", "Ouro Verde Iranduba", "Paracuuba", "Remanescentes", "Sol Nascente"],
  "Iranduba II": ["Bela Vista - Iranduba II", "Boa Fé Iranduba", "Iranduba II - Central", "Janauari", "Maná de Deus", "Morada do Sol", "Nova Manaus", "Novo Amanhecer", "Provedor", "São Francisco - Iranduba", "São Sebastião - Iranduba", "Tenda do Senhor", "Terra de Calebe", "Terra de Canaa", "Terra Firme"],
  "Itamarati": ["Albertina Lisboa", "Beira Rio", "Chibauazinho", "Ebenézer - Itamarati", "Flexal - Itamarati", "Grande Circular", "Itamarati-a", "Maranata Itamarati", "Quiriru", "Shekinah Itamarati"],
  "Japiim I": ["lalo", "Japiim I", "Porto Seguro"],
  "Japiim II": ["Japiim II", "Manaus 2000", "Nova Republica-a"],
  "Juruá": ["Forte das Graças", "Juruá I- Central", "Juruá II", "Jurua III", "Juruá IV", "Juruá V", "Juruá VI", "Juruá VII"],
  "Lago do Limão": ["Ariaú", "Comunidade do Caldeirão", "Lago do Limão", "Lago do Ubim", "Milagre de Deus", "Morada do Sol - Lago do Limão", "Nova Semente", "Paricatuba", "Poder de Deus", "Ramal da Cachoeira", "Remanescente Iranduba III", "Serra Baixa"],
  "Liberdade": ["Betânia", "Comunidade Luz", "Liberdade Central", "Liberdade Il", "Liberdade Viva"],
  "Lírio do Vale": ["Augusto Montenegro", "Castelo Forte-a", "Lirio do Vale Central", "Lirio do Vale I", "Nova Esperança - Manaus", "Nova Esperança II"],
  "Manacapuru - Central": ["Ajaratuba", "Biribiri", "Canabuoca", "Canabuoca III", "Correnteza", "Lago do Jacaré", "Manacapuru - Central", "Maranata - Vila do Jacaré", "Mundurucus I", "Mundurucus II", "Santuário da Colina", "Vila do Jacaré"],
  "Manacapuru - Liberdade": ["Caapiranga", "Campinas do Norte", "Ilha do Marrecão", "Lago do Araras", "Liberdade Central - Manacapuru", "Marreção", "Mutirão", "Novo Horizonte - Manacapuru", "Orla Liberdade", "São José"],
  "Manacapuru - Terra Preta": ["Arautos do Advento", "Estrela da Manhã - Mpu - Terra Preta", "Heróis da Fé", "Manacapuru - Remanescente", "Membeca", "Minha Casa Minha Vida", "Novo Manaca", "Novo Manancial", "Rosa de Sarom", "Terra Preta Central - Manacapuru", "Terra Preta II", "Uixi Maranata", "Umari", "Uniao", "Vale do Amanhecer - Manacapuru", "Vale Verde"],
  "Manacapuru - Unidos em Cristo": ["Atalaia de Cristo", "Barro Branco", "Bela Vista - Manacapuru", "Calebe", "Cipoal", "Ebenézer - Manacapuru", "Getsemani - Manacapuru", "Laranjal", "Maranata - Manacapuru", "Nova Aliança", "Nova Esperança - Manacapuru", "Novo Amanhecer - Manacapuru", "Ramal do Japonés", "Shekinah", "Unidos em Cristo"],
  "Maraä": ["Acanauê", "B 13", "Benedito Ramos", "Betel - Maraä", "Comunidade do Curupira", "Comunidade do Miriti", "Dalila Maciel", "Dona Pepê", "Japurá - Maraä", "Manguari", "Maraa - Central", "Maria Santa", "Nova Esperança - Maraā", "Ricardo Avelino", "Sao Pedro Jacitara"],
  "Novo Airão": ["Aruaú", "Bairro do Chicó", "Bom Jesus do Puduari", "Ebenézer - Novo Airão", "Igarapé Açú", "Leão de Judá", "Luz Gloriosa", "Maranata - Santo Antonio", "Monte Sinai - Novo Airão", "Nova Esperança - Novo Airão", "Nova Jerusalém-a-b", "Novo Airão - Central", "Novo Horizonte - Novo Airão", "Olaria", "Peniel", "Terra Preta - Novo Airão", "Turi Tupāna"],
  "Petrópolis": ["Jardim Petrópolis", "Panorama", "Petrópolis", "São Francisco II", "Vale do Amanhecer"],
  "Presidente Vargas": ["Comunidade Haitiana", "Presidente Vargas", "Vieiralves"],
  "Raiz": ["Comunidade Viva +", "Crespo", "Nova Betânia", "Raiz - Central"],
  "Santo Agostinho": ["Bela Vista do Jaraqui", "Bosque", "Comunidade Agrovila", "Comunidade Baixote", "Comunidade de Fátima", "Comunidade Livramento", "Comunidade São Sebastião", "Ebenezer - Santo Agostinho", "Nova Canaã do Rio Cuieiras", "Nova Rio Negro", "Rio Negro", "Santo Agostinho - Central", "Santo Agostinho IV", "Tatu"],
  "Santo Antônio": ["Areal", "Glória", "Santo Antônio - Central", "Santo Antonio II", "Santo Antônio III", "São Raimundo"],
  "São Francisco": ["Aleixo", "São Francisco - Central", "São Sebastião", "São Sebastião II"],
  "São Gabriel da Cachoeira": ["Areal - São Gabriel", "Cucuí", "Dabarú", "Itacoatiara Mirim/km 10", "Miguel Quirino", "Sarita Izabel do Rio Negro", "São Gabriel da Cachoeira - Central", "Thiago Montalvo"],
  "São Jorge": ["Espaço Novo Tempo", "São Jorge", "Vila da Prata", "Vila da Prata II", "Vitória Régia-a"],
  "Tabatinga": ["Brilhante", "Comara", "Comunicações", "Espaço Novo Tempo Umariaçú II", "Nova Esperança - Tabatinga", "Novo Progresso", "Rui Barbosa - Tabatinga", "Santa Rosa", "Santos Dumont", "São Jorge - Tabatinga", "Tabatinga", "Tancredo Neves", "Vila Nobre", "Vila Paraiso", "Vila Verde", "Xingu II"],
  "Tefé I": ["Comunidade Boarasinho Esperança Viva", "Comunidade Nova Esperança - Tefé", "Deus de Promessa", "Deus Fiel", "lasd Km 17", "Missão Calebe", "Monte Sião - Tefé", "Tefé - Central", "Tefé III - Abial", "Tefé IV - Monte Castelo", "Uarini", "Vila Nova - Tefé"],
  "Tefé II": ["Acará", "Alvarães", "Bom Jardim", "Éfeso", "Ipecaçú", "Jardim Lara", "Jurupari", "Lirio do Vale (tefé li)", "Monte Moriá II - Tefé", "Nova Esperança - Tefé", "Ocine Litaiff", "Tefé II Jerusalém - Central", "Tefé V-Monte Horebe"]
};

export default function App() {
  const [view, setView] = useState('register');
  const [formData, setFormData] = useState({ name: '', phone: '', district: '', church: '' });
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(1200);
  const [isAdminAuth, setIsAdminAuth] = useState(false);
  const [results, setResults] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [isQuizOpen, setIsQuizOpen] = useState(true); // NOVO: Controle de status do quiz

  // Escuta se o quiz está aberto ou fechado em tempo real
  useEffect(() => {
    try {
      const unsub = onSnapshot(doc(db, 'settings', 'status'), (docSnap) => {
        if (docSnap.exists()) {
          setIsQuizOpen(docSnap.data().isOpen);
        } else {
          // Se o documento não existir, cria ele como aberto por padrão
          setDoc(doc(db, 'settings', 'status'), { isOpen: true });
        }
      });
      return () => unsub();
    } catch (e) {
      console.log("Aguardando configuração de regras/status.", e);
    }
  }, []);

  // Timer do quiz
  useEffect(() => {
    if (view === 'quiz' && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else if (view === 'quiz' && timeLeft === 0) {
      handleSubmitQuiz();
    }
  }, [timeLeft, view]);

  // Carrega resultados do admin
  // Carrega resultados do admin
  useEffect(() => {
    if (isAdminAuth) {
      try {
        // Removemos o orderBy daqui para evitar bloqueios de índice no Firebase
        const q = query(collection(db, 'results'));

        const unsub = onSnapshot(q, (snap) => {
          let data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

          // Ordena os dados no próprio código: Maior nota primeiro, depois menor tempo
          data.sort((a, b) => {
            if (b.score !== a.score) {
              return b.score - a.score; // Decrescente por nota
            }
            return a.timeSpent - b.timeSpent; // Crescente por tempo (desempate)
          });

          setResults(data);
        }, (err) => console.error("Erro na leitura do painel: ", err.message));

        return () => unsub();
      } catch (err) {
        console.log("Erro ao carregar admin", err);
      }
    }
  }, [isAdminAuth]);

  const handleStartQuiz = () => {
    if (!formData.name || !formData.phone || !formData.district || !formData.church) {
      alert("Preencha todos os campos antes de continuar!");
      return;
    }

    // A verificação de duplicidade foi removida daqui. 
    // Agora o usuário vai direto para o quiz.
    setView('quiz');
  };

  const handleAnswer = (questionId, option) => {
    setAnswers(prev => ({ ...prev, [questionId]: option }));
  };

  const handleSubmitQuiz = async () => {
    let score = 0;
    QUESTIONS.forEach(q => {
      if (answers[q.id] === q.answer) score++;
    });

    try {
      await addDoc(collection(db, 'results'), {
        ...formData,
        score,
        timeSpent: 1200 - timeLeft,
        answers,
        submittedAt: new Date()
      });
      setView('success');
    } catch (error) {
      alert("Houve um erro ao enviar. Verifique sua conexão e avise o administrador.");
      console.error(error);
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Botão para o administrador abrir/fechar o quiz
  const toggleQuizStatus = async () => {
    try {
      await setDoc(doc(db, 'settings', 'status'), { isOpen: !isQuizOpen });
    } catch (e) {
      alert("Erro ao alterar o status do quiz.");
    }
  };

  const AdminPanel = () => (
    <div className="w-full max-w-6xl mx-auto p-4 md:p-8">
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
        <div className="bg-blue-900 p-6 text-white flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h2 className="text-3xl font-extrabold">Painel do Administrador</h2>
            <p className="text-blue-200 mt-1">Status atual: {isQuizOpen ? '🟢 ABERTO (Recebendo respostas)' : '🔴 FECHADO (Acesso bloqueado)'}</p>
          </div>
          <div className="flex gap-3">
            <button onClick={toggleQuizStatus} className={`px-6 py-2 rounded-lg font-bold transition shadow-md border-2 ${isQuizOpen ? 'bg-yellow-500 hover:bg-yellow-600 text-yellow-900 border-yellow-600' : 'bg-green-500 hover:bg-green-600 text-white border-green-600'}`}>
              {isQuizOpen ? 'Bloquear Acesso' : 'Liberar Acesso'}
            </button>
            <button onClick={() => setView('register')} className="px-6 py-2 bg-red-500 hover:bg-red-600 rounded-lg font-bold transition shadow-md border-2 border-red-600">Sair</button>
          </div>
        </div>

        <div className="overflow-x-auto p-4 md:p-6 bg-gray-50">
          <table className="w-full text-left bg-white rounded-lg shadow-sm">
            <thead>
              <tr className="bg-blue-100 text-blue-900 uppercase text-sm leading-normal">
                <th className="py-4 px-6 border-b font-bold text-center">Nº</th>
                <th className="py-4 px-6 border-b font-bold">Participante</th>
                <th className="py-4 px-6 border-b font-bold">Local</th>
                <th className="py-4 px-6 border-b font-bold text-center">Nota</th>
                <th className="py-4 px-6 border-b font-bold text-center">Tempo</th>
                <th className="py-4 px-6 border-b font-bold text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="text-gray-700 text-sm font-medium">
              {results.length === 0 && (
                <tr><td colSpan="6" className="py-8 text-center text-gray-500">Nenhum resultado recebido ainda.</td></tr>
              )}
              {results.map((res, idx) => (
                <React.Fragment key={res.id}>
                  <tr className="border-b border-gray-200 hover:bg-gray-100 transition duration-150">
                    <td className="py-4 px-6 text-center font-bold text-lg text-gray-500">{idx + 1}º</td>
                    <td className="py-4 px-6">
                      <div className="font-bold text-gray-800">{res.name}</div>
                      <div className="text-xs text-gray-500">{res.phone}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-semibold">{res.district}</div>
                      <div className="text-xs text-blue-600">{res.church}</div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className="bg-green-100 text-green-700 py-1 px-3 rounded-full font-bold text-base shadow-sm">
                        {res.score}/20
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center font-mono text-gray-600">
                      {formatTime(res.timeSpent)}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <button
                        onClick={() => setExpandedId(expandedId === res.id ? null : res.id)}
                        className={`px-4 py-2 rounded-md font-bold transition shadow-sm ${expandedId === res.id ? 'bg-gray-500 text-white' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
                      >
                        {expandedId === res.id ? 'Ocultar' : 'Revisar'}
                      </button>
                    </td>
                  </tr>
                  {expandedId === res.id && (
                    <tr>
                      <td colSpan="6" className="bg-blue-50 p-6 border-b-4 border-blue-200">
                        <div className="mb-4">
                          <span className="font-black text-xl text-blue-900">Aproveitamento: {((res.score / 20) * 100).toFixed(0)}%</span>
                        </div>
                        {!res.answers ? (
                          <div className="text-gray-500 italic">As respostas individuais não foram salvas para este participante.</div>
                        ) : (
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {QUESTIONS.map(q => {
                              const userAnswer = res.answers[q.id];
                              const isCorrect = userAnswer === q.answer;
                              return (
                                <div key={q.id} className={`p-4 rounded-xl shadow-sm border-l-4 ${isCorrect ? 'bg-white border-green-500' : 'bg-red-50 border-red-500'}`}>
                                  <p className="font-bold text-gray-800 mb-2 text-sm">{q.id}. {q.text}</p>
                                  <p className="text-sm mb-1 text-gray-700"><strong>Marcou:</strong> {userAnswer || 'Deixou em branco'}</p>
                                  {!isCorrect && <p className="text-sm text-green-700 font-bold mt-2">Correta: {q.answer}</p>}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-sky-100 py-10 px-4 flex flex-col items-center justify-center font-sans">

      {view !== 'admin' && (
        <div className="w-full max-w-2xl bg-[#8B4513] rounded-3xl shadow-2xl p-6 md:p-10 border-4 border-yellow-500 relative">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white text-center mb-2 drop-shadow-md tracking-wide">
            QUIZ PRIMÁRIOS
          </h1>
          <div className="bg-green-600 text-white font-bold py-1 px-4 rounded-full mx-auto w-max mb-8 border-2 border-white shadow-sm">
            Fase Distrital
          </div>

          {view === 'register' && (
            <div className="space-y-4">
              {/* Lógica da trava: Se fechado, esconde o formulário. Se aberto, exibe. */}
              {!isQuizOpen ? (
                <div className="bg-red-500/20 border-2 border-red-400 p-8 rounded-2xl text-center shadow-inner">
                  <h2 className="text-3xl font-extrabold text-white mb-4">Quiz Encerrado 🔒</h2>
                  <p className="text-white text-lg">O quiz não está aceitando respostas no momento. Aguarde a liberação do líder ou as instruções oficiais.</p>
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-yellow-300 text-center mb-6">Cadastro do Representante</h2>
                  <div>
                    <label className="block text-white font-semibold mb-1">Nome Completo</label>
                    <input type="text" className="w-full p-3 rounded-xl text-gray-800 shadow-inner" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Digite o nome do participante..." />
                  </div>
                  <div>
                    <label className="block text-white font-semibold mb-1">WhatsApp do Responsável</label>
                    <input type="text" className="w-full p-3 rounded-xl text-gray-800 shadow-inner" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} placeholder="(00) 00000-0000" />
                  </div>
                  <div>
                    <label className="block text-white font-semibold mb-1">Distrito</label>
                    <select className="w-full p-3 rounded-xl text-gray-800 shadow-inner" value={formData.district} onChange={e => setFormData({ ...formData, district: e.target.value, church: '' })}>
                      <option value="">Selecione o Distrito...</option>
                      {Object.keys(DISTRICTS).map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  {formData.district && (
                    <div>
                      <label className="block text-white font-semibold mb-1">Igreja</label>
                      <select className="w-full p-3 rounded-xl text-gray-800 shadow-inner" value={formData.church} onChange={e => setFormData({ ...formData, church: e.target.value })}>
                        <option value="">Selecione a Igreja...</option>
                        {DISTRICTS[formData.district].map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  )}
                  <button
                    onClick={handleStartQuiz}
                    className="w-full mt-6 bg-yellow-400 hover:bg-yellow-500 text-[#8B4513] text-xl font-extrabold py-4 rounded-2xl shadow-lg transition-transform transform hover:scale-105"
                  >
                    INICIAR QUIZ
                  </button>
                </>
              )}

              {/* O botão do Admin continua acessível mesmo se o quiz estiver fechado */}
              <div className="pt-6 text-center">
                <button onClick={() => {
                  const pwd = prompt("Senha do administrador:");
                  if (pwd === import.meta.env.VITE_ADMIN_PASSWORD) { setIsAdminAuth(true); setView('admin'); } else if (pwd !== null) { alert("Senha incorreta!"); }
                }} className="text-white/60 hover:text-white text-sm underline transition">
                  Acessar Área do Admin
                </button>
              </div>
            </div>
          )}

          {view === 'quiz' && (
            <div className="text-white">
              <div className="flex justify-between items-center bg-white/20 p-4 rounded-xl mb-6 shadow-inner">
                <span className="font-bold text-lg">Tempo restante:</span>
                <span className={`text-3xl font-black ${timeLeft < 120 ? 'text-red-400 animate-pulse' : 'text-yellow-300'}`}>{formatTime(timeLeft)}</span>
              </div>

              <div className="space-y-8">
                {QUESTIONS.map((q, idx) => (
                  <div key={q.id} className="bg-white/10 p-5 rounded-2xl border border-white/20 shadow-md">
                    <p className="text-lg md:text-xl font-bold mb-4">{idx + 1}. {q.text}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {q.options.map(opt => (
                        <button
                          key={opt}
                          onClick={() => handleAnswer(q.id, opt)}
                          className={`p-3 rounded-xl text-left font-semibold transition-all ${answers[q.id] === opt ? 'bg-yellow-400 text-[#8B4513] shadow-md border-2 border-yellow-200 scale-[1.02]' : 'bg-white/20 hover:bg-white/30 border-2 border-transparent'}`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={handleSubmitQuiz}
                disabled={Object.keys(answers).length < QUESTIONS.length}
                className={`w-full mt-8 text-xl font-extrabold py-5 rounded-2xl shadow-lg transition-all ${Object.keys(answers).length < QUESTIONS.length
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed opacity-50'
                  : 'bg-green-500 hover:bg-green-400 text-white transform hover:scale-105 border-4 border-green-600'
                  }`}
              >
                {Object.keys(answers).length < QUESTIONS.length ? 'RESPONDA TODAS AS PERGUNTAS' : 'FINALIZAR E ENVIAR'}
              </button>
            </div>
          )}

          {view === 'success' && (
            <div className="text-center py-12">
              <div className="text-7xl mb-6 animate-bounce">🎉</div>
              <h2 className="text-4xl font-extrabold text-white mb-4">Parabéns!</h2>
              <p className="text-2xl text-yellow-300 font-semibold mb-6">Sua resposta foi enviada com sucesso.</p>
              <p className="text-white/80">Você já pode fechar esta página.</p>
            </div>
          )}
        </div>
      )}

      {view === 'admin' && <AdminPanel />}

    </div>
  );
}