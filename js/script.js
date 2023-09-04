class Imagen{
    constructor(id,nombre,imagen,descripcion,categoria){
        this._nombre=nombre;
        this._imagen=imagen;
        this._id = id;
        this._descripcion = descripcion;
        this._categoria = categoria;
    }
}

let inputImagen = document.querySelector('#inputImagen');
let imagenFormulario = document.querySelector('#imagenFormulario');
let formulario = document.querySelector('#formulario');
let tbody = document.querySelector('#tbody');
let inputName = document.querySelector("#name");
let inputDescripcion = document.querySelector("#descripcion");
let tarjeta_zoom = document.querySelector(".tarjeta-zoom");
let btnAgregar = document.querySelector('#btnAgregar');
let inputCategoria = document.querySelector('#categoria');
let inputBusqueda = document.querySelector('#busqueda');
let tfilas = tbody.getElementsByTagName('tr');

window.addEventListener("load", actualizarTabla);
formulario.addEventListener("submit",validarFormulario);
inputImagen.addEventListener('change', loadImageInFormulario );
inputBusqueda.addEventListener('keyup',busqueda);

let objImage;
let id_editar;
let listaImagenes = backup();


function backup(){
    let json = JSON.parse(localStorage.getItem('array'));
    return json ? json : []  
}

function busqueda(){
    const filtro = inputBusqueda.value.toLowerCase();
    for (let i = 0; i < tfilas.length; i++) {
        const fila = tfilas[i];
        const textoImagen = fila.getElementsByTagName('td')[1].textContent.toLowerCase(); 
         
        if(textoImagen.includes(filtro)){
            fila.setAttribute('style',`display:""`);
        }else{
            fila.setAttribute('style',"display:none");
        }
    }
}


function validarFormulario(e){
    e.preventDefault();
    if(inputName.value ===''){
        alert('Campos vacios');
        return;
    }

    if(btnAgregar.textContent === "Nuevo"){

        
        const selectFile = inputImagen.files[0];
        if(selectFile){
            if (selectFile.size <= 1024 * 1024) {
                    const reader = new FileReader();
                    reader.readAsDataURL(selectFile); 
                
                    reader.onload = function(e){ //se le asigna como atributo la url
                    const imgUrl = e.target.result; //retorna la url generada
                    imagenFormulario.src = imgUrl;
                    objImage = new Imagen(listaImagenes.length+1,inputName.value,imgUrl,inputDescripcion.value, inputCategoria.value);

                    addObjetToLocalStorage(objImage);
                    processFormSuccess()
                }
            } else {
                alert('Image size must low than 1 MB')
                imagenFormulario.src = "";
            }
        }else{
            alert('Image not loaded')
        }

    }else if(btnAgregar.textContent === "Editar"){

        const selectFile = inputImagen.files[0];
        if(selectFile){
            if (selectFile.size <= 1024 * 1024) {
                const reader = new FileReader();
                reader.readAsDataURL(selectFile); 
                reader.onload = function(e){ //se le asigna como atributo la url
                    const imgUrl = e.target.result; //retorna la url generada
                    imagenFormulario.src = imgUrl;
                    
                    editStoredImagen(id_editar,inputName.value,imgUrl,inputDescripcion.value,inputCategoria.value)
                    processFormSuccess()
                    
                }
            } else {
                alert('Image size must low than 1 MB')
                imagenFormulario.src = "";
            }
            
        }else{
            editStoredImagen(id_editar,inputName.value,"",inputDescripcion.value,inputCategoria.value);
            processFormSuccess()
        }

    }else{
        alert('O_0 Error en el servidor');
    }
  
    
}

function processFormSuccess(){
    limpiarCampos();
    actualizarTabla(); 
    mostrarFormulario(0);
}


function addObjetToLocalStorage(objImage){
    listaImagenes.push(objImage);
    localStorage.setItem(`array`,JSON.stringify(listaImagenes));
}


function loadImageInFormulario(){
    const file = inputImagen.files[0];
    if(file){
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function(){
            imagenFormulario.src = reader.result;
        }
    }
}

function actualizarTabla(){
    listaImagenes = backup();
    console.log(listaImagenes);
    while (tbody.firstChild) {
        tbody.removeChild(tbody.firstChild);
    }
    
    if(listaImagenes.length>0){
        
        listaImagenes.forEach( e=>{
       
            let contenido = `
            <tr>
                <td>${e._id}</td>
                <td>
                    ${e._nombre}
                </td>
                <td>
                    ${e._categoria}
                </td>
                <td>
                    <img class="litle-image" src="${e._imagen}" alt="">
                </td>
                <td>
                    <img data-id=${e._id}  class="icon" src="assets/images/icons/eye535193.png" alt="" onclick = onclickZoomImagen(this) >
                    
                </td>
                <td >
                    <img data-id=${e._id} class="icon" src="assets/images/icons/edit.png" alt="" onclick = onclickEditImagen(this)>
                </td>
                <td > 
                    <img data-id=${e._id} class="icon" src="assets/images/icons/delete484611.png" alt="" onclick = onclickBorrarImagen(this) >
                </td>
            </tr>
            `   
            let fila = document.createElement('tr');
            fila.innerHTML = contenido;
            tbody.appendChild(fila);
            
        })
    
    }else{
        
        let contenido = `
            <tr>
            <td colspan="7" id="tablaVacio"> 
                No se encotraron valores
             </td>
            </tr>
            `   
            let fila = document.createElement('tr');
            fila.innerHTML = contenido;
            tbody.appendChild(fila);
    }

    
     
}

function limpiarCampos(){
    imagenFormulario.src = "";
    inputName.value = "";
    inputImagen.value = "";
    inputDescripcion.value = "";
    inputCategoria.selectedIndex = 0;
}


function onclickZoomImagen(element){
    let id_select = element.getAttribute("data-id");
    document.querySelector("#imagen_titulo").textContent = getObjectImagen(id_select)._nombre;
    document.querySelector("#imagen_descripcion").textContent = getObjectImagen(id_select)._descripcion;
    document.querySelector("#imagen_categoria").textContent = getObjectImagen(id_select)._categoria;
    document.querySelector("#imagen_zoom").src = getObjectImagen(id_select)._imagen;
    tarjeta_zoom.setAttribute('style','display:flex');
}

function onclickBorrarImagen(element){
    let id_borrar = element.getAttribute("data-id");
    deleteStoredImage(id_borrar);
    actualizarTabla();
}

function onclickEditImagen(element){
    id_editar = element.getAttribute("data-id");
    mostrarFormulario(1);
    btnAgregar.textContent = "Editar";
    let objEdit = getObjectImagen(id_editar);
    inputName.value = objEdit._nombre;
    imagenFormulario.src = objEdit._imagen;
    inputDescripcion.value = objEdit._descripcion;
    inputCategoria.value = objEdit._categoria;
}


function getObjectImagen(id){
    let img={};
    listaImagenes.forEach(e=>{
        if(e._id === parseInt(id)){
            img = e;
        }
    })
    return img;
}



function deleteStoredImage(id){
    
    let newListaImagenes = listaImagenes.filter(e=>{
        return e._id !== parseInt(id);
    })

    newListaImagenes.forEach((e,i)=>{
        e._id = i+1;
    })
    localStorage.setItem(`array`,JSON.stringify(newListaImagenes));  
}

function editStoredImagen(id,nombre,imagen,descripcion,categoria){
    if(imagen !== ""){
        listaImagenes.forEach(e=>{
            if(e._id === parseInt(id)){
                e._nombre = nombre;
                e._imagen = imagen;
                e._descripcion = descripcion;
                e._categoria = categoria;
            }
        })
    }else{
        listaImagenes.forEach(e=>{
            if(e._id === parseInt(id)){
                e._nombre = nombre;
                e._descripcion = descripcion;   
                e._categoria = categoria;
            }
        })
    }
    
    localStorage.setItem(`array`,JSON.stringify(listaImagenes));
}

// Cerrar tarjeta

function onclickClosedPreview(){
    tarjeta_zoom.setAttribute('style','display:none');  
}


function mostrarFormulario(value){
    limpiarCampos();
    let section = document.querySelector('aside');
    btnAgregar.textContent = "Nuevo";
    if(value){   
        section.setAttribute('style','right:0')
    }else{
        section.setAttribute('style','right:-650px')
    }
    
}

function limpiarTabla(){
    localStorage.setItem(`array`,JSON.stringify([]));  
    actualizarTabla();
}


//EL obj reader es una interfaz para manejar un file img
    //su metodo readAsDataURL lee y convierte el contenido de la imagen en una URL de datos
    //url(representación en base64 del contenido binario del archivo.)
    //una vez que termina este proceso se dispara el evento onload del obj reader;



// OJO e.target - se refiere al elemento que origino el evento 
// e.tarjet.result == reader.result,  e.tarjet = reader