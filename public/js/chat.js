const socket = io()

const $messageForm = document.querySelector('#message-form');
const $messageFromInput = $messageForm.querySelector('input');
const $messageFormButton = $messageForm.querySelector('button');
const $sendLocationButton = document.querySelector('#send-location');
const $messages = document.querySelector('#messages')
const $sidebar = document.querySelector('#sidebar')

// Options
const params = new URLSearchParams(document.location.search.substring(1));
const username = params.get('username')
const room = params.get('room')

const autoscroll = () => {
    // New message element
    const $newMessage = $messages.lastElementChild

    // Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMaring = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMaring

    // Visible height
    const visibleHeight = $messages.offsetHeight

    // Height of messages conatainer
    const conatainerHeight = $messages.scrollHeight

    // How far have I srolled?
    const scrollOffset = $messages.scrollTop + visibleHeight

    if(conatainerHeight - newMessageHeight -5 <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
}

const markupMessage = (message) => {
    const html = `
        <div class="message">
            <p>
                <span class="message__name">${message.username}</span>
                <span class="message__meta">${message.createdAt}</span>
            </p>
            ${message.text.includes('http') ? 
            `<p><a href="${message.text}" target="_blank">My current location</a></p>` : 
            `<p>${message.text}</p>`}
        </div>
    `
    $messages.insertAdjacentHTML('beforeend', html);
}

socket.on('message', (message) => {
    console.log(message);
    markupMessage(message)
    autoscroll()
})

const markupSidebar = (room, users) => {
    const html =`
        <h2 class="room-title">${room}</h2>
        <h3 class="list-title">Users</h3>
        <ul class="users">
            ${users.map(user => `<li>${user.username}</li>`).join('')}
        </ul>
    `
    $sidebar.innerHTML = html
}

socket.on('roomData', ({ room, users }) => {
    console.log(users);
    users.forEach(user => console.log(user.username))
    markupSidebar(room, users)
})

$messageForm.addEventListener('submit', (e)=> {
    e.preventDefault();

    $messageFormButton.disabled = true;

    const inputValue = e.target.elements.message.value
    socket.emit('sendMessage', inputValue, (message) => {
        $messageFormButton.disabled = false;
        $messageFromInput.value = '';
        $messageFromInput.focus();

        console.log('The message was delivered!', message);
    });
    inputValue.value = ''
})

$sendLocationButton.addEventListener('click', () => {
    if(!navigator.geolocation) {
        return alter('Geolocation is not supported by your browser')
    }

    $sendLocationButton.disabled = true;

    navigator.geolocation.getCurrentPosition((position) => {
        const {latitude, longitude} = position.coords;
        socket.emit('sendLocation', {
            latitude,
            longitude
        }, () => {
            $sendLocationButton.disabled = false;
            console.log('Location shared');
        })
    })
})

socket.emit('join', { username, room }, (error) => {
    if(error) {
        alert(error)
        location.href = '/'
    }
})

