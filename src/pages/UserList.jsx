import { useUsers } from "../hooks/useUsers"

function UserList() {
    const { users, loading } = useUsers()

    if(loading) return <div>Carregando...</div>

    return (
        <ul>
            {users.map(user => <li key={user.id}>{user.name}</li>)}
        </ul>
    )
}