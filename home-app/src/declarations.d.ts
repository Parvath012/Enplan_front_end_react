declare module "commonApp/*" {
    const Component: React.ComponentType<any>;
    export default Component;
}

// Optional: More flexible declaration to handle named exports
declare module "commonApp" {
    export * from "commonApp/*";
}