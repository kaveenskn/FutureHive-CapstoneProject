import React from 'react'

export default function MentorCard({mentor, onViewMore}){
  return (
    <div className="bg-white dark:bg-slate-800 shadow-sm border rounded-lg p-4 flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{mentor.name}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-300">{mentor.expertise.join(' • ')}</p>
          </div>
          <div className="text-slate-600 dark:text-slate-300 text-sm">{mentor.experience} yrs</div>
        </div>

        <p className="mt-3 text-sm text-slate-600 dark:text-slate-300 line-clamp-3">{mentor.bio}</p>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {mentor.email && (
            <a href={`mailto:${mentor.email}`} className="text-sm px-3 py-1 bg-sky-50 text-sky-700 rounded-md hover:bg-sky-100">Email</a>
          )}
          {mentor.linkedin && (
            <a href={mentor.linkedin} target="_blank" rel="noreferrer" className="text-sm px-3 py-1 bg-gray-50 text-slate-700 rounded-md hover:bg-gray-100">LinkedIn</a>
          )}
        </div>
        <div>
          <button onClick={() => onViewMore && onViewMore(mentor)} className="text-sm text-slate-700 hover:underline">View More</button>
        </div>
      </div>
    </div>
  )
}
