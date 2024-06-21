import Matter from "matter-js";

export default abstract class Main {
    // Width property represents the initial width of the application window.
    width: number = window.innerWidth;

    // Height property represents the initial height of the application window.
    height: number = window.innerHeight;

    // Matter engine, responsible for managing physics simulations.
    protected Engine = Matter.Engine;
    // Matter render, used to visualize physics simulations.
    protected Render = Matter.Render;
    // Matter runner, manages and updates the physics simulation.
    protected Runner = Matter.Runner;
    // Matter bodies, represents individual objects in a physics world.
    protected Bodies = Matter.Bodies;
    // Matter composite, helps manage and update multiple physics bodies at once.
    protected Composite = Matter.Composite;
    // Matter composites, used to create complex shapes out of simpler ones.
    protected Composites = Matter.Composites;
    // Matter constraint, used to connect two or more physics bodies together.
    protected Constraint = Matter.Constraint;
    // Matter mouse constraint, helps manage user input for physics simulations.
    protected MouseConstraint = Matter.MouseConstraint;
    // Matter mouse, handles user input (e.g., clicking and dragging) in physics simulations.
    protected Mouse = Matter.Mouse;
    // Matter body, represents individual objects in a physics world.
    protected Body = Matter.Body;
    // Matter vector, used to represent direction and magnitude of movements or forces.
    protected Vector = Matter.Vector;
    protected World = Matter.World;

    // The engine instance is created for managing the physics simulation.
    protected engine!: Matter.Engine;

    // The render instance is used to visualize the physics simulation.
    protected render!: Matter.Render;

    // A reference to the world, where all the physical bodies are stored and managed.
    protected world!: Matter.World

    protected Events = Matter.Events
    /**
     *
     */
    constructor() {
        this.engine = this.Engine.create();
        this.world = this.engine.world;
    }
}