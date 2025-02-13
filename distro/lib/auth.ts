namespace Lib.Auth {
    /**
     * Login as a user
     * @param username The username
     * @param password The password
     * @returns { API.User }
     */
    export function login(username: string, password: string): API.User | null {
        if (Distro.rootFSController.getFile(`/var/usr/${username}/password`).read() == Lib.Encryption.hash(password)) {
            return new API.User(username);  
        };
        return null;
    };
};