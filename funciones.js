

const tarjetas = document.querySelectorAll('.tarjeta')
const modal = document.getElementById('modal')
const pista = document.getElementById('modal-carousel-track')
const puntos = document.getElementById('carousel-dots')
const anterior = document.querySelector('.carousel-control.anterior')
const siguiente = document.querySelector('.carousel-control.siguiente')
const titulo = document.getElementById('titulo')
const precio = document.getElementById('precios')
const marca = document.getElementById('marca')
const detalles = document.getElementById('detalles')

let imagenesActuales = []
let posicion = 0
let tarjetaActual = null
let cantidad = 1
let talleSeleccionado = ''

const cartKey = 'auren-carrito'
const cartCount = document.getElementById('agregar-carrito')
const addToCartButton = document.querySelector('.modal-actions button[type="button"]')
const unidad = document.querySelector('.query-numer')
const sizeSelector = document.getElementById('size-selector')
const sizeOptions = document.getElementById('size-options')

const readCart = () => JSON.parse(localStorage.getItem(cartKey) || '[]')
const updateCartCount = () => {
    cartCount.textContent = readCart().reduce((total, product) => total + (Number(product.quantity) || 1), 0)
}

const actualizarEstadoAgregar = () => {
    if (!addToCartButton) return

    const tienePrecio = tarjetaActual?.dataset.precios &&
        tarjetaActual.dataset.precios !== 'Precio a definir'
    const requiereTalle = Boolean(tarjetaActual?.dataset.talles)
    addToCartButton.disabled = !tienePrecio || (requiereTalle && !talleSeleccionado)
    addToCartButton.textContent = !tienePrecio
        ? 'Precio pendiente'
        : requiereTalle && !talleSeleccionado
            ? 'Elegí un talle'
            : 'Agregar al carrito'
}

const cargarTalles = (tarjeta) => {
    if (!sizeSelector || !sizeOptions) return

    talleSeleccionado = ''
    sizeOptions.replaceChildren()
    const talles = (tarjeta.dataset.talles || '')
        .split(',')
        .map(talle => talle.trim())
        .filter(Boolean)

    sizeSelector.hidden = talles.length === 0
    talles.forEach(talle => {
        const boton = document.createElement('button')
        boton.type = 'button'
        boton.className = 'size-option'
        boton.textContent = talle
        boton.addEventListener('click', () => {
            talleSeleccionado = talle
            sizeOptions.querySelectorAll('.size-option').forEach(opcion => {
                opcion.classList.toggle('selected', opcion === boton)
                opcion.setAttribute('aria-pressed', String(opcion === boton))
            })
            actualizarEstadoAgregar()
        })
        sizeOptions.append(boton)
    })
}

const abrirDetalles = (tarjeta) => {
    tarjetaActual = tarjeta
    cantidad = 1
    unidad.textContent = cantidad
    cargarTalles(tarjeta)
    const imagenTarjeta = tarjeta.querySelector('.watch-product-image')?.getAttribute('src')
    imagenesActuales = imagenTarjeta
        ? [...new Set([imagenTarjeta, ...(tarjeta.dataset.imagenes || tarjeta.dataset.imagen || '').split(',').map(ruta => ruta.trim()).filter(Boolean)])]
        : []
    pista.replaceChildren()
    puntos.replaceChildren()
    posicion = 0

    imagenesActuales.forEach((ruta, indice) => {
        const imagen = document.createElement('img')
        imagen.src = ruta.trim()
        imagen.alt = `${tarjeta.dataset.titulo}, imagen ${indice + 1}`
        pista.append(imagen)

        const punto = document.createElement('span')
        punto.className = 'carousel-dot'
        if (indice === 0) punto.classList.add('active')
        puntos.append(punto)
    })

    anterior.hidden = imagenesActuales.length < 2
    siguiente.hidden = imagenesActuales.length < 2
    puntos.hidden = imagenesActuales.length < 2
    pista.style.transform = 'translateX(0)'
    titulo.textContent = tarjeta.dataset.titulo
    precio.textContent = tarjeta.dataset.precios
    marca.textContent = tarjeta.dataset.marca
    detalles.textContent = tarjeta.dataset.detalles
    actualizarEstadoAgregar()
    modal.showModal()
}

tarjetas.forEach(tarjeta => {
    tarjeta.tabIndex = 0
    tarjeta.setAttribute('role', 'button')
    tarjeta.setAttribute('aria-haspopup', 'dialog')
    tarjeta.setAttribute('aria-label', `Ver detalles de ${tarjeta.dataset.titulo}`)
    tarjeta.addEventListener('click', () => abrirDetalles(tarjeta))
    tarjeta.addEventListener('keydown', event => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            abrirDetalles(tarjeta)
        }
    })
})

addToCartButton.addEventListener('click', () => {
    if (tarjetaActual?.dataset.talles && !talleSeleccionado) return
    const cart = readCart()
    const title = tarjetaActual.dataset.titulo
    const product = {
        id: tarjetaActual.dataset.id || `reloj-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
        image: tarjetaActual.dataset.imagen,
        category: tarjetaActual.dataset.categoria || 'Relojes',
        title,
        price: tarjetaActual.querySelector('.watch-price')?.textContent.trim() || tarjetaActual.dataset.precios,
        quantity: cantidad,
        size: talleSeleccionado
    }
    const existingIndex = cart.findIndex((item) =>
        item.id === product.id && (item.size || '') === talleSeleccionado
    )

    if (existingIndex === -1) {
        cart.push(product)
    } else {
        cart[existingIndex].quantity = (Number(cart[existingIndex].quantity) || 1) + cantidad
    }

    localStorage.setItem(cartKey, JSON.stringify(cart))
    updateCartCount()

    const originalText = addToCartButton.textContent
    addToCartButton.textContent = 'Agregado ✓'
    addToCartButton.disabled = true
    window.setTimeout(() => {
        addToCartButton.textContent = originalText
        addToCartButton.disabled = false
    }, 1400)
})

anterior.addEventListener('click', () => {
    if (posicion > 0) {
        posicion--
        pista.style.transform = `translateX(-${posicion * 100}%)`
    }
})
siguiente.addEventListener('click', () => {
    if (posicion < imagenesActuales.length - 1) {
        posicion++
        pista.style.transform = `translateX(-${posicion * 100}%)`
    }
})

const maximizar = document.querySelector('.query-max')
const minimizar = document.querySelector('.query-min')

maximizar.addEventListener('click', () =>{
    cantidad++
    unidad.textContent = cantidad
})
minimizar.addEventListener('click', ()=>{
    if(cantidad > 1) {
        cantidad--
        unidad.textContent= cantidad
    }
})

updateCartCount()
   