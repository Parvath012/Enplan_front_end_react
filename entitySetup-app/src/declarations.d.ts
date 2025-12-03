declare module "commonApp/*" {
    const Component: React.ComponentType<any>;
    export default Component;
}

declare module "commonApp" {
    export * from "commonApp/*";
}
