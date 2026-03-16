"use client"

import { useState } from "react"
import ProjectForm from "@/components/Shared/ProjectForm"
import { toast } from "sonner"

type Template = {
  emoji: string
  title: string
  prompt: string
}

const Templates = [
  {
    "emoji": "📝",
    "title": "Build a note taking app",
    "prompt": "Create a clean note-taking app with a sidebar listing notes and a main editor area for writing and editing notes using local state. Support creating, renaming, and deleting notes. Focus on minimal design, comfortable spacing, and distraction-free writing."
  },
  {
    "emoji": "📊",
    "title": "Build a analytics dashboard",
    "prompt": "Build an analytics dashboard with metric cards, a line chart placeholder, and a recent activity table using mock data and local state. Use a clean grid layout, consistent card spacing, and a modern dashboard style."
  },
  {
    "emoji": "💬",
    "title": "Build a chat UI",
    "prompt": "Create a modern chat interface with a conversation list sidebar, a message thread area, and an input box for sending messages using local state. Include message bubbles, timestamps, and clean alignment similar to messaging apps."
  },
  {
    "emoji": "📅",
    "title": "Build a calendar app",
    "prompt": "Build a calendar application with a monthly grid view, event cards, and a modal for adding and editing events using local state. Focus on clear date spacing, hover states, and visual hierarchy for events."
  },
  {
    "emoji": "✅",
    "title": "Build a todo manager",
    "prompt": "Create a todo manager with task categories, progress indicators, and the ability to add, edit, and delete tasks using local state. Use clean typography, subtle shadows, and intuitive interactions for a productive UI."
  },
  {
    "emoji": "📚",
    "title": "Build a documentation site",
    "prompt": "Build a documentation style layout with a left sidebar for navigation, a main content area with headings and sections, and a search bar placeholder. Focus on readability, structured spacing, and a clean technical design."
  },
  {
    "emoji": "🧑‍💻",
    "title": "Build a developer portfolio",
    "prompt": "Create a modern developer portfolio homepage with a hero section, project cards, skill badges, and a contact section using mock data. Use balanced spacing, subtle animations, and a polished layout."
  },
  {
    "emoji": "🍔",
    "title": "Build a restaurant menu page",
    "prompt": "Build a restaurant menu page with category tabs, menu item cards with images and prices, and a cart preview using local state. Focus on attractive food card layouts, clear typography, and a welcoming design."
  }
]

export default function ProjectBuilder() {
  const [prompt, setPrompt] = useState("")

  const setPromptOnClick = (templatePrompt: string) => {
    setPrompt(templatePrompt)
    toast.success("Prompt set! Scroll up to see the form.", {
      style: {
        background: "white",
        color: "black",
        border: "1px solid #e5e7eb",
      }
    })
  }

  return (
    <>
      <div className="mb-6 w-full max-w-2xl">
        <ProjectForm key={prompt} initialPrompt={prompt} />
      </div>
        <h1 className="text-xl font-bold md:text-2xl">
            Want <span className="text-[#ff4136]">Idea's?</span>
        </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {Templates.map((template, index) => (
          <button
            key={index}
            onClick={() => setPromptOnClick(template.prompt)}
            className="group relative p-5 rounded-2xl border-2 cursor-pointer border-neutral-200 bg-white 
            hover:border-[#ff4136]/40 hover:shadow-lg hover:-translate-y-0.5
            transition-all duration-200 text-left"
          >
            <div className="flex flex-col gap-3">
              <span
                className="flex items-center justify-center w-10 h-10 rounded-lg 
                bg-[#ff4136]/10 text-2xl"
              >
                {template.emoji}
              </span>

              <h3 className="text-sm font-semibold text-neutral-800 group-hover:text-[#ff4136] transition-colors">
                {template.title}
              </h3>

              <p className="text-xs text-neutral-500 line-clamp-2">
                {template.prompt}
              </p>
            </div>

            <div className="absolute inset-0 rounded-2xl 
            bg-linear-to-br from-[#ff4136]/5 to-transparent 
            opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          </button>
        ))}
      </div>
    </>
  )
}