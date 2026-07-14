#!/usr/bin/env node
type Request = {
    id?: string | number;
    method: string;
    params?: {
        name?: string;
        arguments?: Record<string, unknown>;
    };
};
export declare function handleRequest(request: Request): unknown;
export {};
