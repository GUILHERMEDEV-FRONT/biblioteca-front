import { useState, useEffect } from "react";
import { getUsers } from "./../services/userService";

export function useUsers(){
    const [users, setUser] = useState([])
    const [loading, setLoading] = useState(true)

    const refreshUsers = async () => {
        try {
            const data = await getUsers();
            setUsers(data);
        } finally {
            setLoading(false)
        }

    };

    useEffect(() => { refreshUsers()}, [])

    return { users, loading, refreshUsers}
}
