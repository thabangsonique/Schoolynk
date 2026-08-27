import React, { useState } from "react";
import { X } from "lucide-react";
import { useCreateSubjectMutation } from "../../features/api";

export default function CreateSubject({ teachers = [], classes = [], onClose, onCreated }) {
	const [form, setForm] = useState({ name: "", code: "", description: "", lead_teacher_id: "", weekly_hours: "", classroom_ids: [] });
	const [createSubject, { isLoading, error }] = useCreateSubjectMutation();
	const inputClass = "mt-1 w-full rounded-lg border border-text-secondary/10 bg-background px-3 py-3 text-sm text-white outline-none focus:border-primary";
	const labelClass = "text-sm font-semibold text-white";
	const change = (event) => setForm((previous) => ({ ...previous, [event.target.name]: event.target.value }));
	const toggleClass = (id) => setForm((previous) => ({ ...previous, classroom_ids: previous.classroom_ids.includes(id) ? previous.classroom_ids.filter((classId) => classId !== id) : [...previous.classroom_ids, id] }));
	const submit = async (event) => {
		event.preventDefault();
		await createSubject({ ...form, name: form.name.trim(), code: form.code.trim() || undefined, description: form.description.trim() || undefined, lead_teacher_id: form.lead_teacher_id || undefined, weekly_hours: Number(form.weekly_hours) || 0 }).unwrap();
		if (onCreated) await onCreated();
		onClose();
	};
	return (
		<div className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 px-4 backdrop-blur-md" onClick={onClose}>
			<form onSubmit={submit} onClick={(event) => event.stopPropagation()} className="w-full max-w-2xl overflow-hidden rounded-2xl border border-text-secondary/20 bg-card-2 text-white shadow-2xl">
				<div className="flex items-start justify-between border-b border-text-secondary/10 bg-background px-6 py-4"><div><h2 className="text-xl font-bold">Add Subject</h2><p className="mt-1 text-sm text-text-secondary">Define a new elementary subject</p></div><button type="button" onClick={onClose} className="text-text-secondary hover:text-white" aria-label="Close"><X size={21} /></button></div>
				<div className="grid grid-cols-1 gap-4 px-6 py-6 sm:grid-cols-2"><label className={labelClass}>Subject Name<input name="name" value={form.name} onChange={change} className={inputClass} placeholder="Mathematics" required /></label><label className={labelClass}>Subject Code<input name="code" value={form.code} onChange={change} className={inputClass} placeholder="SUB-109" /></label><label className={`${labelClass} sm:col-span-2`}>Description<textarea name="description" value={form.description} onChange={change} className={`${inputClass} min-h-20 resize-y`} placeholder="Brief course objectives and topics covered..." /></label><label className={labelClass}>Lead Teacher<select name="lead_teacher_id" value={form.lead_teacher_id} onChange={change} className={inputClass}><option value="">No lead teacher</option>{teachers.map((teacher) => <option key={teacher.id} value={teacher.id}>{`${teacher.profiles?.first_name ?? ""} ${teacher.profiles?.last_name ?? ""}`.trim() || teacher.employee_number}</option>)}</select></label><label className={labelClass}>Weekly Hours<input type="number" name="weekly_hours" value={form.weekly_hours} onChange={change} className={inputClass} min="0" placeholder="4" /></label></div>
				<div className="mx-6 border-t border-text-secondary/10 pt-4"><p className="text-sm font-semibold">Assign to Classrooms</p><div className="mt-3 flex flex-wrap gap-2 rounded-lg border border-text-secondary/10 bg-background p-3">{classes.map((classroom) => <button type="button" key={classroom.id} onClick={() => toggleClass(classroom.id)} className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${form.classroom_ids.includes(classroom.id) ? "bg-primary text-black" : "border border-text-secondary/20 text-text-secondary"}`}>{classroom.name ?? `Grade ${classroom.grade}`}</button>)}</div></div>
				{error && <p className="px-6 pt-4 text-sm text-red-400">{error?.data?.message ?? "Failed to create subject."}</p>}
				<div className="mt-6 flex justify-end gap-4 border-t border-text-secondary/10 px-6 py-4"><button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold text-text-secondary hover:text-white">Cancel</button><button type="submit" disabled={isLoading} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-black disabled:opacity-60">{isLoading ? "Saving..." : "Save Subject"}</button></div>
			</form>
		</div>
	);
}
