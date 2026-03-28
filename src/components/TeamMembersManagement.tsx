import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Plus, CreditCard as Edit, Trash2, Save, X } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

interface TeamMember {
  id: string;
  full_name: string;
  position: string;
  avatar_url: string;
  display_order: number;
  is_active: boolean;
}

const TeamMembersManagement = () => {
  const { isCeo, isAdmin } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    full_name: "",
    position: "",
    avatar_url: "",
    display_order: 0,
  });

  const { data: members = [], refetch } = useQuery({
    queryKey: ["team-members"],
    queryFn: async () => {
      const { data } = await supabase
        .from("team_members")
        .select("*")
        .order("display_order", { ascending: true });
      return data || [];
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = editingId
      ? await supabase.from("team_members").update(formData).eq("id", editingId)
      : await supabase.from("team_members").insert(formData);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success(editingId ? "Member updated!" : "Member added!");
    setShowForm(false);
    setEditingId(null);
    setFormData({ full_name: "", position: "", avatar_url: "", display_order: 0 });
    refetch();
  };

  const handleEdit = (member: TeamMember) => {
    setEditingId(member.id);
    setFormData({
      full_name: member.full_name,
      position: member.position,
      avatar_url: member.avatar_url,
      display_order: member.display_order,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this member?")) return;
    const { error } = await supabase.from("team_members").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Member deleted!");
      refetch();
    }
  };

  const canManage = isCeo || isAdmin;

  return (
    <div>
      {canManage && (
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl font-bold text-foreground">Team Members</h2>
          <button
            onClick={() => {
              setShowForm(!showForm);
              setEditingId(null);
              setFormData({ full_name: "", position: "", avatar_url: "", display_order: 0 });
            }}
            className="flex items-center gap-1 px-3 py-2 bg-primary text-primary-foreground text-sm rounded-lg hover:opacity-90 transition"
          >
            {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {showForm ? "Cancel" : "Add Member"}
          </button>
        </div>
      )}

      {showForm && canManage && (
        <form onSubmit={handleSubmit} className="bg-card rounded-xl p-4 border border-border mb-4 space-y-3">
          <input
            value={formData.full_name}
            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            placeholder="Full Name"
            required
            className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm"
          />
          <input
            value={formData.position}
            onChange={(e) => setFormData({ ...formData, position: e.target.value })}
            placeholder="Position"
            required
            className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm"
          />
          <input
            value={formData.avatar_url}
            onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
            placeholder="Avatar URL"
            className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm"
          />
          <input
            value={formData.display_order}
            onChange={(e) => setFormData({ ...formData, display_order: Number(e.target.value) })}
            placeholder="Display Order"
            type="number"
            className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm"
          />
          <button
            type="submit"
            className="flex items-center gap-1 px-4 py-2 bg-primary text-primary-foreground text-sm rounded-lg"
          >
            <Save className="w-4 h-4" />
            {editingId ? "Update" : "Create"}
          </button>
        </form>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {members.map((member: TeamMember) => (
          <div
            key={member.id}
            className="bg-card rounded-xl p-4 border border-border shadow-card hover:shadow-elevated transition-all duration-300 animate-fade-in"
          >
            <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center overflow-hidden">
              {member.avatar_url ? (
                <img src={member.avatar_url} alt={member.full_name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-lg font-display font-bold text-primary-foreground">
                  {member.full_name.charAt(0)}
                </span>
              )}
            </div>
            <h3 className="font-display text-sm font-semibold text-foreground text-center mb-1">
              {member.full_name}
            </h3>
            <p className="text-xs text-muted-foreground text-center">{member.position}</p>
            {canManage && (
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => handleEdit(member)}
                  className="flex-1 p-2 bg-secondary text-secondary-foreground rounded-lg hover:opacity-80 transition"
                >
                  <Edit className="w-3 h-3 mx-auto" />
                </button>
                <button
                  onClick={() => handleDelete(member.id)}
                  className="flex-1 p-2 bg-destructive text-destructive-foreground rounded-lg hover:opacity-80 transition"
                >
                  <Trash2 className="w-3 h-3 mx-auto" />
                </button>
              </div>
            )}
          </div>
        ))}
        {members.length === 0 && (
          <div className="col-span-full text-center text-muted-foreground py-8">No team members yet.</div>
        )}
      </div>
    </div>
  );
};

export default TeamMembersManagement;
