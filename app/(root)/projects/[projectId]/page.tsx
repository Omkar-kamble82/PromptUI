import ProjectView from '@/components/Shared/ProjectView'

const Page = async({params} : { params: Promise<{ projectId: string }> }) => {
    const {projectId} = await params;
    return (
        <ProjectView projectId={projectId} />
    )
}

export default Page