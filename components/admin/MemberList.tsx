"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

type Member = {
  id: string
  name: string
  active: boolean
}

type Props = {
  initialMembers: Member[]
  apiPath: string // "/api/mas" or "/api/providers"
  label: string   // "MA" or "Provider"
}

export function MemberList({ initialMembers, apiPath, label }: Props) {
  const [members, setMembers] = useState<Member[]>(initialMembers)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState("")
  const [addingName, setAddingName] = useState("")
  const [isAdding, setIsAdding] = useState(false)
  const [loading, setLoading] = useState<string | null>(null)

  async function handleSaveEdit(id: string) {
    if (!editingName.trim()) return
    setLoading(id)
    const res = await fetch(`${apiPath}/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editingName.trim() }),
    })
    const json = await res.json()
    setLoading(null)
    if (!res.ok) {
      toast.error(json.error || "Failed to update")
      return
    }
    setMembers((prev) => prev.map((m) => (m.id === id ? json.data : m)))
    setEditingId(null)
    toast.success("Name updated")
  }

  async function handleToggleActive(member: Member) {
    setLoading(member.id)
    const res = await fetch(`${apiPath}/${member.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !member.active }),
    })
    const json = await res.json()
    setLoading(null)
    if (!res.ok) {
      toast.error(json.error || "Failed to update")
      return
    }
    setMembers((prev) => prev.map((m) => (m.id === member.id ? json.data : m)))
    toast.success(json.data.active ? `${label} reactivated` : `${label} deactivated`)
  }

  async function handleAdd() {
    if (!addingName.trim()) return
    setLoading("new")
    const res = await fetch(apiPath, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: addingName.trim() }),
    })
    const json = await res.json()
    setLoading(null)
    if (!res.ok) {
      toast.error(json.error || "Failed to add")
      return
    }
    setMembers((prev) => [...prev, json.data])
    setAddingName("")
    setIsAdding(false)
    toast.success(`${label} added`)
  }

  const active = members.filter((m) => m.active)
  const inactive = members.filter((m) => !m.active)

  return (
    <div className="space-y-6">
      {/* Active members */}
      <div className="rounded-2xl border border-[#CCCACB] bg-white shadow-sm overflow-hidden">
        {active.length === 0 && (
          <p className="p-6 text-sm text-[#7A7A7A]">No active {label}s yet.</p>
        )}
        {active.map((member, i) => (
          <div
            key={member.id}
            className={`flex items-center gap-3 px-6 py-4 ${i < active.length - 1 ? "border-b border-[#CCCACB]" : ""}`}
          >
            {editingId === member.id ? (
              <>
                <Input
                  autoFocus
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSaveEdit(member.id)
                    if (e.key === "Escape") setEditingId(null)
                  }}
                  className="h-8 max-w-xs text-sm"
                />
                <Button
                  size="sm"
                  onClick={() => handleSaveEdit(member.id)}
                  disabled={loading === member.id}
                  className="bg-[#066880] hover:bg-[#005A9A] text-white rounded-2xl"
                >
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setEditingId(null)}
                  className="text-[#4E545B] rounded-2xl"
                >
                  Cancel
                </Button>
              </>
            ) : (
              <>
                <span className="flex-1 text-sm font-medium text-[#1A1618]">
                  {member.name}
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setEditingId(member.id)
                    setEditingName(member.name)
                  }}
                  className="text-[#4E545B] hover:text-[#066880] rounded-2xl"
                >
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleToggleActive(member)}
                  disabled={loading === member.id}
                  className="text-[#7A7A7A] hover:text-[#EF4444] rounded-2xl text-xs"
                >
                  Deactivate
                </Button>
              </>
            )}
          </div>
        ))}

        {/* Add new row */}
        {isAdding && (
          <div className="flex items-center gap-3 px-6 py-4 border-t border-[#CCCACB] bg-[#FFFEF9]">
            <Input
              autoFocus
              placeholder={`${label} name`}
              value={addingName}
              onChange={(e) => setAddingName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAdd()
                if (e.key === "Escape") { setIsAdding(false); setAddingName("") }
              }}
              className="h-8 max-w-xs text-sm"
            />
            <Button
              size="sm"
              onClick={handleAdd}
              disabled={loading === "new"}
              className="bg-[#066880] hover:bg-[#005A9A] text-white rounded-2xl"
            >
              Add
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => { setIsAdding(false); setAddingName("") }}
              className="text-[#4E545B] rounded-2xl"
            >
              Cancel
            </Button>
          </div>
        )}
      </div>

      {/* Inactive members (collapsed section) */}
      {inactive.length > 0 && (
        <div>
          <p className="text-xs font-medium text-[#7A7A7A] uppercase tracking-wide mb-2">
            Inactive ({inactive.length})
          </p>
          <div className="rounded-2xl border border-[#CCCACB] bg-white shadow-sm overflow-hidden">
            {inactive.map((member, i) => (
              <div
                key={member.id}
                className={`flex items-center gap-3 px-6 py-4 ${i < inactive.length - 1 ? "border-b border-[#CCCACB]" : ""}`}
              >
                <span className="flex-1 text-sm text-[#7A7A7A] line-through">
                  {member.name}
                </span>
                <Badge variant="secondary" className="text-xs rounded-full">
                  Inactive
                </Badge>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleToggleActive(member)}
                  disabled={loading === member.id}
                  className="text-[#066880] hover:text-[#005A9A] rounded-2xl text-xs"
                >
                  Reactivate
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add button (shown when not in adding mode) */}
      {!isAdding && (
        <Button
          onClick={() => setIsAdding(true)}
          className="bg-[#066880] hover:bg-[#005A9A] text-white rounded-2xl"
        >
          + Add {label}
        </Button>
      )}
    </div>
  )
}
