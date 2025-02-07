import { useRecoilValue } from "recoil"
import { useEffect, useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { IoMdCheckboxOutline } from "react-icons/io"
import { MdOutlineCheckBoxOutlineBlank } from "react-icons/md"
import ReportTitle from "@/containers/main/reports/ReportTitle"
import viewState from "@/states/viewState"
import useOpenLink from "@/hooks/useOpenLink"
import axiosInstance from "@/utils/axiosInstance"
import useErrorResponseHandler from "@/hooks/useErrorResponseHandler"

export default function ReportPage() {
  const view = useRecoilValue(viewState)
  const report = view.data
  const openLink = useOpenLink()
  const errorHandler = useErrorResponseHandler()
  const queryClient = useQueryClient()

  const [jsonReport, setJsonReport] = useState(JSON.parse(report.content))

  // 체크박스 상태 변경 핸들러
  const onCheckChange = (description: string, checked: boolean) => {
    const updatedReport = jsonReport.map((category: any) => ({
      ...category,
      task_objects: category.task_objects.map((task: any) => ({
        ...task,
        items: task.items.map((item: any) => (item.description === description ? { ...item, checked } : item)),
      })),
    }))
    setJsonReport(updatedReport)
  }

  const { mutate } = useMutation({
    mutationFn: (data: any) => {
      return axiosInstance.put(`/reports/temp/${report.id}`, data)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/reports/temp"] }),
    onError: (err) => errorHandler(err),
  })

  useEffect(() => {
    mutate({ content: JSON.stringify(jsonReport) })
  }, [jsonReport])

  return (
    <div className="flex flex-col w-full bg-white rounded-lg p-6 gap-3 min-h-[170px] border border-border-gray drop-shadow-small">
      <ReportTitle dateString={report.date} />
      <div className="flex flex-col gap-10">
        {jsonReport.map((category: any) => (
          <div key={category.title} className="flex flex-col gap-3">
            <h3 className="text-xl font-bold">{category.title}</h3>
            {category.task_objects.map((task: any) => (
              <div key={task.title} className="flex flex-col gap-3">
                <h4 className="font-bold">{task.title}</h4>
                {task.items.map((item: any) => (
                  <div key={item.description} className="flex">
                    <button
                      type="button"
                      aria-label="체크 박스"
                      className="pr-2 flex items-start group"
                      onClick={() => onCheckChange(item.description, !item.checked)}
                    >
                      <div className="pt-1 text-xl group-hover:drop-shadow-[0_0_4px_rgba(0,0,0,0.25)] transition-all">
                        {item.checked ? (
                          <IoMdCheckboxOutline />
                        ) : (
                          <MdOutlineCheckBoxOutlineBlank className="text-text-gray" />
                        )}
                      </div>
                    </button>
                    <div>
                      <p className={`${item.checked ? "text-text-gray" : "text-[#303030]"}`}>
                        <span className={item.checked ? "line-through" : ""}>{item.description}</span>
                        {item.links.map((link: any) => (
                          <button type="button" key={link} onClick={() => openLink(link)}>
                            🔗
                          </button>
                        ))}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
