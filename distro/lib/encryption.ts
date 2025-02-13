namespace Lib.Encryption {
    export function hash(data: string): string {
        let hash = 0;
        for (let i = 0; i < data.length; i++) {
            const char = data.charCodeAt(i);
            hash = (hash << 5) - hash + char;
            hash = hash & hash;
        };
        return hash.toString();
    };
};
