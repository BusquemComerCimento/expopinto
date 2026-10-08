// URL base usada nas chamadas ao backend.
// URL base usada nas requisições para o backend.
const API="/api";
// Formata números como moeda brasileira.
// Formata valores como moeda brasileira.
const money=v=>Number(v).toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
// Atalho para selecionar o primeiro elemento de um seletor CSS.
// Atalho para selecionar um elemento da página.
const $=(s,r=document)=>r.querySelector(s);
// Atalho para selecionar todos os elementos de um seletor CSS.
const $=(s,r=document)=>[...r.querySelectorAll(s)];
// Recupera a sacola salva no navegador.
// Recupera a sacola salva no navegador ou começa com uma sacola vazia.
let cart=JSON.parse(localStorage.getItem("cls_cart")||"[]");
// Guarda o slide atual do carrossel.
// Guarda o índice do slide atualmente exibido no carrossel.
let slide=0;
// Salva a sacola e atualiza seu contador.
// Salva a sacola e atualiza o contador.
const save=()=>{localStorage.setItem("cls_cart",JSON.stringify(cart));updateCount()};
// Atualiza a quantidade total de itens exibida no cabeçalho.
// Atualiza a quantidade de itens mostrada na interface.
// Atualiza o contador de produtos da sacola no cabeçalho.
function updateCount(){$$("[data-cart-count]").forEach(e=>e.textContent=cart.reduce((a,x)=>a+x.qty,0))}
// Centraliza requisições à API e tratamento de erros.
// Centraliza as chamadas à API e o tratamento de erros.
// Centraliza as requisições ao backend e trata respostas de erro.
async function api(path,opt={}){
  const r=await fetch(API+path,{credentials:"same-origin",headers:{"Content-Type":"application/json"},...opt});
  let d={};try{d=await r.json()}catch{}
  if(!r.ok)throw Error(d.erro||"Não foi possível concluir.");
  return d;
}
// Monta o HTML visual de um produto.
// Monta o HTML de um card de produto.
// Monta o HTML visual de um card de produto.
function card(p){
  return `<article class="product-card">
    <a href="/produto/${p.id}">
      <div class="product-image"><img src="${p.imagem}" alt="${p.nome}" loading="lazy"></div>
      <div class="product-meta"><span>${p.categoria}</span><h3>${p.nome}</h3><strong>${money(p.preco)}</strong></div>
    </a>
    <button class="add" data-add="${p.id}">ADICIONAR À SACOLA</button>
  </article>`;
}
// Busca produtos usando os filtros atuais do catálogo.
// Carrega o catálogo usando os filtros escolhidos.
// Carrega o catálogo e aplica os filtros escolhidos pelo visitante.
async function catalog(){
  const box=$("[data-catalog]");if(!box)return;
  const params=new URLSearchParams({
    busca:$("[data-search]").value,
    categoria:$("[data-category]").value,
    ordem:$("[data-order]").value
  });
  const p=await api("/produtos?"+params);
  box.innerHTML=p.length?p.map(card).join(""):"<p>Nenhuma peça encontrada.</p>";
}
// Carrega os produtos marcados como destaque.
// Carrega os produtos destacados na página inicial.
// Carrega e exibe os produtos destacados na página inicial.
async function featured(){
  const box=$("[data-featured]");if(!box)return;
  const p=await api("/produtos?ordem=recentes");
  box.innerHTML=p.filter(x=>x.destaque).slice(0,4).map(card).join("");
}
// Carrega categorias da API para o filtro do catálogo.
// Carrega as categorias usadas no filtro.
// Carrega as categorias do backend e preenche os filtros do catálogo.
async function categories(){
  const s=$("[data-category]");if(!s)return;
  (await api("/categorias")).forEach(c=>s.insertAdjacentHTML("beforeend",`<option>${c.nome}</option>`));
}
// Carrega e monta a página de detalhes de um produto.
// Carrega os detalhes do produto atual.
// Carrega os dados e monta a página de detalhes de um produto.
async function product(){
  const box=$("[data-product-detail]");if(!box)return;
  try{
    const p=await api("/produtos/"+location.pathname.split("/").pop());
    box.innerHTML=`<div class="detail-image"><img src="${p.imagem}" alt="${p.nome}"></div>
    <div class="detail-copy"><p class="kicker">${p.categoria}</p><h1>${p.nome}</h1>
    <strong class="detail-price">${money(p.preco)}</strong><p>${p.descricao}</p>
    <p class="stock">${p.disponivel?p.estoque+" unidades no estoque":"Fora de estoque"}</p>
    <button class="button red" data-add="${p.id}" ${p.disponivel?"":"disabled"}>ADICIONAR À SACOLA</button></div>`;
  }catch{box.innerHTML="<h1>Produto não encontrado.</h1>"}
}
// Adiciona um produto à sacola ou aumenta sua quantidade.
async function add(id){
  const p=await api("/produtos/"+id),x=cart.find(i=>i.id===id);
  x?x.qty++:cart.push({id,nome:p.nome,preco:p.preco,imagem:p.imagem,qty:1});
  save();toast(p.nome+" entrou na sacola.");
}
// Mostra uma mensagem temporária na tela.
// Mostra uma mensagem temporária para o usuário.
// Exibe uma mensagem temporária para informar o usuário sobre uma ação.
function toast(t){
  let e=$(".toast");if(!e){e=document.createElement("div");e.className="toast";document.body.append(e)}
  e.textContent=t;e.classList.add("show");setTimeout(()=>e.classList.remove("show"),2200);
}
// Cria o painel lateral da sacola e seus controles.
// Monta o painel lateral da sacola.
// Monta e atualiza o painel lateral da sacola de compras.
function cartPanel(){
  if($(".cart-panel"))return;
  const e=document.createElement("aside");e.className="cart-panel";
  e.innerHTML=`<button class="close" data-cart-close>×</button><p class="kicker">SUA SACOLA</p><h2>O QUE VAI?</h2>
  ${cart.length?cart.map(i=>`<div class="cart-line"><img src="${i.imagem}" alt=""><div><b>${i.nome}</b><span>${money(i.preco)} × ${i.qty}</span><button data-remove="${i.id}">remover</button></div></div>`).join(""):"<p>Sua sacola está vazia.</p>"}
  <strong class="cart-total">${money(cart.reduce((a,x)=>a+x.preco*x.qty,0))}</strong>
  <button class="button red full" data-checkout ${cart.length?"":"disabled"}>FINALIZAR PEDIDO</button>`;
  document.body.append(e);
}
// Confere o login e encaminha para o pagamento sem criar o pedido ainda.
// Confere o login e encaminha para o pagamento.
// Verifica login e sacola antes de levar o usuário para o pagamento.
async function checkout(){
  try{
    await api("/auth/me");
    if(!cart.length)return toast("Sua sacola está vazia.");
    location.href="/pagamento";
  }catch(e){
    if(e.message.includes("login")||e.message.includes("Faça login"))location.href="/login";else toast(e.message);
  }
}

// Monta o resumo do checkout e alterna os campos do cartão.
// Monta a tela de pagamento demonstrativo.
function paymentPage(){
  const box=$("[data-payment-page]");
  if(!box)return;
  if(!cart.length){
    box.innerHTML=`<div class="empty-payment"><p class="kicker">CLS ENLATADOS / PAGAMENTO</p><h1>SACOLA<br><em>VAZIA.</em></h1><a class="button red" href="/catalogo">VOLTAR AO CATÁLOGO</a></div>`;
    return;
  }

  const total=cart.reduce((a,x)=>a+x.preco*x.qty,0);
  const summary=$("[data-payment-summary]");
  if(summary)summary.innerHTML=cart.map(x=>`
    <div class="payment-line">
      <span>${x.nome} × ${x.qty}</span>
      <strong>${money(x.preco*x.qty)}</strong>
    </div>`).join("")+`<div class="payment-total"><span>Total</span><strong>${money(total)}</strong></div>`;

  const toggle=()=>{
    const method=$("input[name='metodo']:checked")?.value;
    const card=$("[data-card-fields]");
    if(card)card.hidden=method!=="cartao";
  };
  $("input[name='metodo']").forEach(x=>x.addEventListener("change",toggle));
  toggle();
}

// Consulta e exibe o pedido criado após o pagamento.
// Carrega e exibe o pedido criado após o pagamento.
function orderPage(){
  const box=$("[data-order-page]");
  if(!box)return;
  const id=new URLSearchParams(location.search).get("id");
  if(!id){box.innerHTML="<h1>Pedido não encontrado.</h1>";return;}

  api("/pedidos/"+id).then(o=>{
    box.innerHTML=`
      <div class="order-success">
        <p class="kicker">CLS ENLATADOS / PEDIDO CONFIRMADO</p>
        <h1>PEDIDO<br><em>#${o.id}</em></h1>
        <p>Pagamento aprovado. Seu pedido foi criado e já está registrado na sua conta.</p>
        <div class="order-summary">
          ${o.itens.map(i=>`<div class="payment-line"><span>${i.nome} × ${i.quantidade}</span><strong>${money(i.preco_unitario*i.quantidade)}</strong></div>`).join("")}
          <div class="payment-total"><span>Total</span><strong>${money(o.valor_total)}</strong></div>
          <p class="order-status">STATUS: ${o.status.toUpperCase()}</p>
        </div>
        <div class="actions">
          <a class="button red" href="/conta">VER MEUS PEDIDOS</a>
          <a class="button" href="/catalogo">CONTINUAR COMPRANDO</a>
        </div>
      </div>`;
  }).catch(e=>{
    box.innerHTML=`<div class="empty-payment"><h1>OPS.</h1><p>${e.message}</p><a class="button red" href="/conta">IR PARA MINHA CONTA</a></div>`;
  });
}
// Controla slides, indicadores, botões e troca automática do carrossel.
// Controla o carrossel e a troca automática de slides.
// Controla slides, indicadores e troca automática do carrossel.
function carousel(){
  const ss=$$(".hero-slide");if(!ss.length)return;
  const d=$("[data-dots]");
  const show=i=>{
    slide=i;ss.forEach((x,n)=>x.classList.toggle("active",n===i));
    $$("[data-slide]").forEach((x,n)=>x.classList.toggle("active",n===i));
  };
  d.innerHTML=ss.map((_,i)=>`<button data-slide="${i}" aria-label="Ir para imagem ${i+1}"></button>`).join("");
  show(0);
  $("[data-next]").onclick=()=>show((slide+1)%ss.length);
  $("[data-prev]").onclick=()=>show((slide+ss.length-1)%ss.length);
  $$("[data-slide]").forEach((b,i)=>b.onclick=()=>show(i));
  setInterval(()=>show((slide+1)%ss.length),5000);
}
// Exibe mensagens de retorno abaixo dos formulários.
const msg=(f,t)=>{const e=$("[data-form-message]",f);if(e)e.textContent=t};
// Centraliza os eventos de clique da interface.
document.addEventListener("click",async e=>{
  if(e.target.closest("[data-menu]"))$("nav")?.classList.toggle("open");
  if(e.target.closest("[data-cart-open]"))cartPanel();
  if(e.target.closest("[data-cart-close]"))$(".cart-panel")?.remove();
  const a=e.target.closest("[data-add]");if(a)await add(+a.dataset.add);
  const r=e.target.closest("[data-remove]");
  if(r){cart=cart.filter(x=>x.id!==+r.dataset.remove);save();$(".cart-panel")?.remove();cartPanel()}
  if(e.target.closest("[data-checkout]"))await checkout();
  if(e.target.closest("[data-logout]")){await api("/auth/logout",{method:"POST"});location.href="/"}
});
// Processa os formulários sem recarregar as páginas.
document.addEventListener("submit",async e=>{
  const f=e.target;
  if(f.matches("[data-login-form]")){
    e.preventDefault();
    try{await api("/auth/login",{method:"POST",body:JSON.stringify({email:f.email.value,senha:f.senha.value})});location.href="/conta"}
    catch(x){msg(f,x.message)}
  }
  if(f.matches("[data-register-form]")){
    e.preventDefault();
    if(f.senha.value!==f.confirmacao.value)return msg(f,"As senhas não conferem.");
    try{await api("/auth/register",{method:"POST",body:JSON.stringify({nome:f.nome.value,email:f.email.value,senha:f.senha.value})});location.href="/conta"}
    catch(x){msg(f,x.message)}
  }
  if(f.matches("[data-support-form]")){
    e.preventDefault();
    try{await api("/suporte",{method:"POST",body:JSON.stringify(Object.fromEntries(new FormData(f)))});f.reset();msg(f,"Chamado enviado.")}
    catch(x){msg(f,x.message)}
  }
  if(f.matches("[data-payment-form]")){
    e.preventDefault();
    const method=f.querySelector("input[name='metodo']:checked")?.value;
    if(!method)return msg(f,"Escolha uma forma de pagamento.");

    const data={
      metodo:method,
      itens:cart.map(x=>({produto_id:x.id,quantidade:x.qty}))
    };

    try{
      const result=await api("/pagamentos",{
        method:"POST",
        body:JSON.stringify(data)
      });
      cart=[];save();
      location.href="/pedido?id="+result.id;
    }catch(x){msg(f,x.message)}
  }
});
// Atualiza a busca conforme o usuário digita.
document.addEventListener("input",e=>e.target.matches("[data-search]")&&catalog());
// Recarrega o catálogo quando os filtros mudam.
document.addEventListener("change",e=>e.target.matches("[data-category],[data-order]")&&catalog());
// Inicializa os recursos necessários para a página atual.
(async()=>{
  updateCount();carousel();featured();categories();catalog();product();paymentPage();orderPage();
  const o=$("[data-orders]");
  if(o)try{
    const m=await api("/auth/me"),os=await api("/pedidos");
    $("[data-user-name]").textContent=m.usuario.nome;$("[data-user-email]").textContent=m.usuario.email;
    o.innerHTML=os.length?os.map(x=>`<div class="order"><b>#${x.id}</b><span>${x.status}</span><strong>${money(x.valor_total)}</strong></div>`).join(""):"<p>Nenhum pedido ainda.</p>";
  }catch{location.href="/login"}
})();